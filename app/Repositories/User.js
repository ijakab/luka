'use strict'

const User = use('App/Models/User')
const Account = use('App/Models/Account')
const Encryption = use('Encryption')
const Token = use('App/Models/Token')

const {validate, sanitizor} = use('Validator')
const Hash = use('Hash')
const Event = use('Event')
const throwError = use('App/Helpers/ThrowError')

const UserRepository = {
    
    async checkUsername(username) {
        const existingUsername = await User.query().where('username', username).first()
        if(existingUsername) throwError(400, 'auth.usernameExists')
        if(!username.match(/^[0-9a-zA-Z-_]+$/)) throwError(400, 'auth.usernameRegexFail')
    },
    
    async checkEmail(email) {
        const existingMainAccount = await Account.query().where({
            email: sanitizor.normalizeEmail(email),
            type: 'main'
        }).first()
        if (existingMainAccount) throwError(400, 'auth.emailExists')
    },
    
    async register(body) {
        // handle terms logic...
        if (!body.terms_accepted) throwError('auth.acceptTerms')
        body.role = 'user'
        return await UserRepository.createUser(body)
    },
    
    async createUser(body, autoValidate=false) {
        const allParams = User.getAllowedParams(body, [...User.fields, 'password', 'password_confirmation'])
    
        // validate allParams using registrationRules this time... Pass is mandatory!
        const validation = await User.validateParams(allParams, User.registrationRules)
        if (validation.fails()) throwError(400, validation.messages())
    
        // first we check if this email already has MAIN account type
        const existingMainAccount = await Account.query().where({email: allParams.email, type: 'main'}).first()
        if (existingMainAccount) throwError(400, 'auth.emailExists')
    
        // then... let's try to find any account for this email (user can have fb, google, etc. before main)
        const existingAccount = await Account.findBy('email', allParams.email)
    
        // fetch user profile of found account if there is any accounts
        let user = existingAccount && await existingAccount.user().fetch()
    
        // if user is not existing, check username and create new user
        if (!user) {
            await UserRepository.checkUsername(allParams.username)
        
            // manually add params (instead of create(allParams))... registration route is important to have specific logic
            user = await User.create({
                username: allParams.username,
                firstname: allParams.firstname,
                lastname: allParams.lastname,
                email: allParams.email,
                language: allParams.language,
                terms_accepted: new Date(),
                terms_ip: allParams.termsIp,
                role: allParams.role
            })
        }
    
        // now create account
        const mainAccount = await Account.create({
            user_id: user.id,
            type: 'main',
            email: allParams.email,
            password: allParams.password, // will be hashed because of lifecycle hook on model
            validated: false // set validated to false, email needs to be checked for main account...
        })
    
        // fire an event that new user was created... we need to send welcome email, etc.
        Event.fire('user::register', {user, mainAccount})
        
        if(autoValidate) {
            await UserRepository.validateEmail(mainAccount.id)
        }
    
        return user
    },
    
    async login(username, password) {
        if(!username || !password) throwError(400, 'auth.noUsernameOrPassword')
        const {user, mainAccount} = await UserRepository.findLoginUser(username) // we are passing username which can be both username or email
        if (!mainAccount || !user) throwError(400, 'auth.invalidPasswordOrUsername')
        if (!mainAccount.validated) throwError(400, 'auth.mailNotValidated')
        
        const validPass = await Hash.verify(password, mainAccount.password)
        if (!validPass) throwError(400, 'auth.invalidPasswordOrUsername')
        
        return user
    },
    
    async useRefreshToken(refreshToken) {
        if (!refreshToken) throwError(400, 'error.refreshTokenInvalid')
        const decryptedToken = Encryption.decrypt(refreshToken)
        const user = await User
            .query()
            .whereHas('tokens', (builder) => {
                builder.where({token: decryptedToken, type: 'jwt_refresh_token', is_revoked: false})
            })
            .first()
        if (!user) throwError(400, 'error.refreshTokenInvalid')
        
        // delete old refresh token from db
        await Token.query().where('token', decryptedToken).delete()
        return user;
    },
    
    async validateEmail(accountId) {
        if (!accountId) return throwError(401)
        const account = await Account
            .query()
            .where({id: accountId, type: 'main'})
            .first()
        if (!account) throwError(400, 'auth.accountNofFound')
        if (account.validated) throwError(400, 'auth.emailAlreadyValidated')
        
        account.validated = true
        await account.save()
        
        const user = await account.user().fetch()
        Event.fire('user::validated', {user})
        
        return user
    },
    
    async resendValidation(usernameOrEmail) {
        const {user, mainAccount} = await UserRepository.findLoginUser(usernameOrEmail) // username can be both username or email
        if (!user) throwError(400, 'auth.emailOrUsernameNotFound')
        if (!mainAccount) throwError(400, 'auth.mainAccountNotFound')
        if (mainAccount.validated) throwError(400, 'auth.emailAlreadyValidated')
        
        Event.fire('user::resendValidation', {user, mainAccount})
        return user
    },
    
    async forgotPassword(usernameOrEmail) {
        const {user, mainAccount} = await UserRepository.findLoginUser(usernameOrEmail) // username can be both username or email
        if (!user) throwError(400, 'auth.emailOrUsernameNotFound')
        if (!mainAccount) throwError(400, 'auth.mainAccountNotFound')
        if (!mainAccount.validated) throwError(400, 'auth.mailNotValidated')
        
        Event.fire('user::forgotPassword', {user, mainAccount})
        return user;
    },
    
    async resetPassword(accountId, allParams) {
        const validation = await validate(allParams, {
            password: User.registrationRules.password
        })
        if (validation.fails()) throwError(400, validation.messages())
        
        const mainAccount = await Account.findOrFail(accountId)
        mainAccount.password = allParams.password
        await mainAccount.save()
        
        return await mainAccount.user().fetch()
    },
    
    async findLoginUser(usernameOrEmail) {
        let user, mainAccount
        user = await User.findBy('username', usernameOrEmail)
        
        if (user) {
            // we got user, lets fetch his main account
            mainAccount = await user.fetchMainAccount()
        } else {
            // else let's try via main account (sanitize email before)
            usernameOrEmail = sanitizor.normalizeEmail(usernameOrEmail)
            
            mainAccount = await Account.query().where({email: usernameOrEmail, type: 'main'}).first()
            user = mainAccount && await mainAccount.user().fetch()
        }
        
        return {mainAccount, user}
    },
    
    async generateUserTokens(auth, user) {
        return await auth
            .withRefreshToken()
            .generate(user, {
                role: user.role
            })
    }
    
}


module.exports = UserRepository
