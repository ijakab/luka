'use strict'

const User = use('App/Models/User')
const Account = use('App/Models/Account')

const {validate, sanitize, sanitizor, is} = use('Validator')
const Hash = use('Hash')
const Event = use('Event')

class AuthController {

    async checkUsername({request, response}) {

        const existingUsername = await User.query().where('username', request.input('username')).getCount()

        if (!existingUsername) return response.ok()
        response.badRequest('auth.usernameExists')
    }

    async checkEmail({request, response}) {

        const existingMainAccount = await Account.query().where({
            email: sanitizor.normalizeEmail(request.input('email')),
            type: 'main'
        }).getCount()

        if (!existingMainAccount) return response.ok()

        response.badRequest('auth.emailExists')
    }

    async register({request, response, auth, locale}) {

        const allParams = sanitize(request.post(), {
            email: 'normalize_email'
        })

        // email and username are not under unique:users rule because of auto merge account rule
        const validation = await validate(allParams, {
            firstname: 'required',
            lastname: 'required',
            username: `${User.rules.username}|required`,
            email: 'required|email',
            password: `${User.rules.password}|required|confirmed`,
            language: User.rules.language
        })

        if (validation.fails()) return response.badRequest()

        // first we check if this email already has MAIN account type
        const existingMainAccount = await Account.query().where({email: allParams.email, type: 'main'}).getCount()

        if (existingMainAccount) return response.badRequest('auth.emailExists')

        // then... let's try to find any account for this email (user can have fb, google, etc. before main)
        const existingAccount = await Account.findBy('email', allParams.email)

        // fetch user profile of found account if there is any accounts
        let user = existingAccount && await existingAccount.user().fetch()

        // if user is not existing, check username and create new user
        if (!user) {

            const existingUsername = await User.query().where('username', allParams.username).getCount()

            if (existingUsername) return response.badRequest('auth.usernameExists')

            user = await User.create({
                username: allParams.username,
                firstname: allParams.firstname,
                lastname: allParams.lastname,
                email: allParams.email,
                language: allParams.language || locale
            })
        }

        // now create account
        const mainAccount = await Account.create({
            user_id: user.id,
            type: 'main',
            email: allParams.email,
            password: allParams.password,
            validated: false // set validated to false, email needs to be checked for main account...
        })

        // fire an event that new user was created... we need to send welcome email, etc.
        Event.fire('user::register', {user, mainAccount})

        response.ok({user, _message: 'auth.userRegistered'})
    }


    async login({request, response, auth}) {

        const allParams = request.only(['username', 'password'])

        const validation = await validate(allParams, {
            username: 'string|min:4|required', // username can be email or username
            password: `${User.rules.password}|required`
        })

        if (validation.fails()) return response.badRequest()

        const {user, mainAccount} = await this._findLoginUser(allParams.username) // we are passing username which can be both username or email

        // if we don't have user in db, respond with badRequest invalid username or password instead of 404
        if (!mainAccount || !user) return response.badRequest('auth.invalidPasswordOrUsername')

        if (!mainAccount.validated) return response.forbidden('auth.mailNotValidated')

        // check pass
        const validPass = await Hash.verify(allParams.password, mainAccount.password)

        if (!validPass) return response.badRequest('auth.invalidPasswordOrUsername')

        // generate tokens
        const token = await this._generateUserTokens(auth, user)  // you can add token payload if needed as third parameter

        response.ok({user, token: token.token, refreshToken: token.refreshToken})
    }

    async socialRedirect({request, response, params, ally}) {

        if (request.input('linkOnly')) return response.ok({
            url: await ally.driver(params.network).getRedirectUrl()
        })

        await ally.driver(params.network).redirect()
    }

    async socialLogin({request, response, params, ally, auth, locale}) {

        const allParams = request.only(['token', 'accessToken', 'username'])

        const validation = await validate(allParams, {
            token: 'required_without_any:accessToken',
            accessToken: 'required_without_any:token',
            username: User.rules.username // not required!
        })

        if (validation.fails()) return response.badRequest()

        // wire up post as get... so ally can recognize social code
        // todo accessToken is still not working...
        // todo check here: https://github.com/adonisjs/adonis-ally/issues/29
        // todo and here: https://forum.adonisjs.com/t/adonis-ally-and-ios-facebook-login/736
        ally._request._qs = {code: allParams.token, accessToken: allParams.accessToken}

        const socialUser = await ally.driver(params.network).getUser()

        // first try finding this user
        let account = await Account.query().where({socialId: socialUser.getId(), type: params.network}).first()
        let user // we will fill this void by newly created user or found one...

        if (account) {
            // user is existing just log him in
            user = await account.user().fetch()
        } else {
            // social user did't exist at all... we will create new user or connect accounts for him
            const fullname = socialUser.getName().split(' ')

            const userObject = sanitize({
                socialId: socialUser.getId(),
                network: params.network,
                firstname: fullname.shift(),
                lastname: fullname.join(' '),
                email: socialUser.getEmail(),
                avatar: socialUser.getAvatar()
            }, {
                email: 'normalize_email'
            })

            // first, let's try to find this user by email
            account = await Account.findBy('email', userObject.email)

            if (account) {
                // just fetch user of this account
                user = await account.user().fetch()
            } else {

                // there is no account at all... we need to create user and account!

                // ****************************************** NOTE ******************************************
                // Social media will return some information but not everything we need for main account creation.
                // We need username as required parameter and we can't get it from social media.
                // This is why we will send status 202 (Accepted) and demand client to call this route again
                // with information that we need (accessToken and username in this case).
                // ****************************************** **** ******************************************

                // first check if user already sent username, if not, demand username before continuing
                if (!allParams.username) return response.accepted({
                    accessToken: socialUser.getAccessToken(),
                    _message: 'auth.socialLoginProvideUsername'
                })

                // check if this username is taken
                const existingUsername = await User.query().where('username', allParams.username).getCount()
                if (existingUsername) return response.badRequest('auth.usernameExists')


                let avatar
                if (userObject.avatar) {
                    // TODO Read NOTE below
                    // ****************************************** NOTE ******************************************
                    // Depending of your logic, you will want to download this avatar from social media, and
                    // save it locally to your server. Maybe you will have model for files... or whatever, so
                    // please edit this as you wish.
                    // ****************************************** **** ******************************************
                    avatar = userObject.avatar
                }

                user = await User.create({
                    username: allParams.username,
                    firstname: userObject.firstname,
                    lastname: userObject.lastname,
                    email: userObject.email,
                    avatar: avatar,
                    language: locale
                })

                // we just created new social user, they are automatically validated (no need for email validation)
                // so... let's send that welcome email to them
                Event.fire('user::validated', {user})
            }

            // now just create account and we are ready to go
            await Account.create({
                user_id: user.id,
                type: params.network,
                socialId: userObject.socialId,
                email: userObject.email,
                validated: true // it's always validated if oAuth was success
            })
        }

        // whatever happens... new user, or existing one... generate token for him
        const token = await this._generateUserTokens(auth, user)  // you can add token payload if needed as third parameter


        response.ok({user, token: token.token, refreshToken: token.refreshToken})
    }

    async refreshToken({request, response, auth}) {

        const refreshToken = request.input('token')

        if (!refreshToken) return response.badRequest()

        // create new token from refresh token
        const newToken = await auth.newRefreshToken().generateForRefreshToken(refreshToken)

        response.ok({token: newToken.token, refreshToken: newToken.refreshToken})


        // TODO Read NOTE below
        // ****************************************** NOTE ******************************************
        // If token had any custom payload. Custom payload will not be present in newly generated
        // access token. If custom payload is easily recreated without knowledge of who user is,
        // just add second parameter to generateForRefreshToken(refreshToken, CUSTOM_PAYLOAD_HERE)
        //
        // If you have custom payload logic, and it's somehow connected to user that is owner of token
        // please adapt code below to your liking. Of course... delete upper code and use only this bottom one :)
        //
        // P.S.: You probably don't need custom payload at all! Think about sending that payload
        // differently. For example... If you have some kind of user permissions in token, why not
        // instead sending them together with user object when user is logged in?
        // ****************************************** **** ******************************************

        // const refreshToken = request.input('token')
        //
        // if (!refreshToken) return response.badRequest()
        //
        // const Encryption = use('Encryption') // NOTE: put this on top of this file, where other imports are
        // const Token = use('App/Models/Token') // NOTE: put this on top of this file, where other imports are
        //
        //
        // const decryptedToken = Encryption.decrypt(refreshToken)
        // const user = await User
        //     .query()
        //     .whereHas('tokens', (builder) => {
        //         builder.where({token: decryptedToken, type: 'jwt_refresh_token', is_revoked: false})
        //     })
        //     .first()
        // if (!user) throw new Error('InvalidRefreshToken')
        //
        // // ****************************************** NOTE ******************************************
        // // handle your custom payload here if needed... you have user object ready :)
        // // ****************************************** **** ******************************************
        // const customPayload = null
        // // ********
        //
        // // create new token from refresh token
        // const newToken = await this._generateUserTokens(auth, user, customPayload)
        //
        // // delete old refresh token from db
        // await Token.query().where('token', decryptedToken).delete()
        //
        //
        // response.ok({token: newToken.token, refreshToken: newToken.refreshToken})
    }


    async validateEmail({response, auth, token}) {

        // first check if this valid token has account info inside
        if (!token.mailValidation) return response.unauthorized()

        // then update account by using account id from token
        const account = await Account
            .query()
            .where({id: token.mailValidation, type: 'main'})
            .first()

        // if account was not found... token is most likely invalid
        if (!account) throw new Error('InvalidJwtToken')

        if (account.validated) return response.badRequest('auth.emailAlreadyValidated')

        account.validated = true
        await account.save()

        const user = await account.user().fetch()
        const newToken = await this._generateUserTokens(auth, user)

        // user just validated his account... send welcome mail
        Event.fire('user::validated', {user})

        // respond with all data as if user has just logged in
        response.ok({user, token: newToken.token, refreshToken: newToken.refreshToken, _message: 'auth.emailValidated'})
    }


    async resendValidation({request, response}) {

        const resendEmail = request.input('resendEmail')

        // check if correct email format was sent
        if (!is.email(resendEmail)) return response.badRequest()

        // find main account for this email
        const mainAccount = await Account.query().where({'email': resendEmail, type: 'main'}).first()

        if (!mainAccount) return response.notFound('auth.emailOrUsernameNotFound')
        if (mainAccount.validated) return response.badRequest('auth.emailAlreadyValidated')

        // send validation email in async way
        Event.fire('user::resendValidation', {mainAccount})

        response.ok('auth.emailValidationResent')
    }


    async forgotPassword({request, response}) {

        const allParams = request.only(['username'])

        const validation = await validate(allParams, {
            username: `min:4|required`
        })

        if (validation.fails()) return response.badRequest()

        // find user and his main account
        const {user, mainAccount} = await this._findLoginUser(allParams.username) // username can be both username or email

        if (!user) return response.notFound('auth.emailOrUsernameNotFound')
        if (!mainAccount) return response.notFound('auth.mainAccountNotFound')

        // also check if this user validated his account at all
        if (!mainAccount.validated) return response.forbidden('auth.mailNotValidated')

        // send forgot password email in async way
        Event.fire('user::forgotPassword', {user, mainAccount})


        response.ok('auth.forgotPasswordTokenSent')
    }


    async resetPassword({request, response, token, auth}) {

        const allParams = request.post()

        // first check if this valid token has account info inside
        if (!token.passwordReset) return response.unauthorized()

        const validation = await validate(allParams, {
            password: `${User.rules.password}|required|confirmed`
        })

        if (validation.fails()) return response.badRequest()

        // find main account by id found inside token
        const mainAccount = await Account.find(token.passwordReset)

        if (!mainAccount) return response.notFound()

        // update password
        mainAccount.password = allParams.password
        await mainAccount.save()

        const user = await mainAccount.user().fetch()

        // generate new token and refresh token after password reset
        const newToken = await this._generateUserTokens(auth, user)

        response.ok({
            user,
            token: newToken.token,
            refreshToken: newToken.refreshToken,
            _message: 'auth.passwordReseted'
        })
    }


    async accounts({response, user}) {

        const accounts = await user.accounts().fetch()

        response.ok(accounts)
    }


    // --- PRIVATE

    async _findLoginUser(usernameOrEmail) {
        // find user by username or main account email
        let user, mainAccount

        // first let's try fetching user via username
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
    }


    async _generateUserTokens(auth, user, customPayload) {

        return await auth
            .withRefreshToken()
            .generate(user, customPayload)

        // TODO Read NOTE below
        // ****************************************** NOTE ******************************************
        // If you are adding custom payload, be aware that it will not stay there after token refresh
        // You need to update refreshToken method to handle custom payload also!
        // ****************************************** **** ******************************************
    }

}


module.exports = AuthController
