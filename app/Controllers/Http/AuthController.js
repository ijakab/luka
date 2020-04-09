'use strict'
const Helper = use('App/Helpers/Common')

const UserRepository = use('App/Repositories/User')

class AuthController {

    async checkUsername({request}) {
        await UserRepository.checkUsername(request.input('username'))
    }

    async checkEmail({request}) {
        await UserRepository.checkEmail(request.input('email'))
    }

    async register({request, locale}) {
        const params = request.body()
        if(!params.language) params.language = locale
        params.terms_ip = Helper.getIp(request)
        
        return  await UserRepository.register(params)
    }


    async login({request, auth}) {
        const {username, password} = request.only(['username', 'password'])
        const user = await UserRepository.login(username, password)
        const token = await UserRepository.generateUserTokens(auth, user)

        return {
            user,
            token: token.token,
            refreshToken: token.refreshToken
        }
    }
    
    //todo refactor this to class for handling social stuff
    async socialRedirect({request, response, params, ally}) {
        if (request.input('linkOnly')) return response.ok({
            url: await ally.driver(params.network).getRedirectUrl()
        })
        await ally.driver(params.network).redirect()
    }

    //todo refactor this to class for handling social stuff
    async socialLogin({request, response, params, ally, auth, locale}) {

        const allParams = request.only(['code', 'accessToken', 'username', 'terms_accepted'])
        if (allParams.terms_accepted) allParams.terms_accepted = new Date()

        const validation = await validate(allParams, {
            code: 'required_without_any:accessToken',
            accessToken: 'required_without_any:code',
            username: User.registrationRules.username.replace(/required\|?/, '') // not required necessarily!!
        })

        if (validation.fails()) return response.badRequest()

        // wire up post as get... so ally can recognize social code
        ally._request._qs = {code: allParams.code, accessToken: allParams.accessToken}

        let socialUser
        if (allParams.accessToken) {
            socialUser = await ally.driver(params.network).getUserByToken(allParams.accessToken)
        } else {
            socialUser = await ally.driver(params.network).getUser()
        }

        // first try finding this user
        let account = await Account.query().where({social_id: socialUser.getId(), type: params.network}).first()
        let user // we will fill this void by newly created user or found one...

        if (account) {
            // user is existing just log him in
            user = await account.user().fetch()
        } else {
            // social user did't exist at all... we will create new user or connect accounts for him
            const fullname = socialUser.getName().split(' ')

            const userObject = sanitize({
                social_id: socialUser.getId(),
                network: params.network,
                firstname: fullname.shift(),
                lastname: fullname.join(' '),
                email: socialUser.getEmail(),
                avatar: socialUser.getAvatar()
            }, User.sanitize)

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

                if (!allParams.terms_accepted) return response.badRequest('auth.acceptTerms')

                // check if this username is taken
                const existingUsername = await User.query().where('username', allParams.username).getCount()
                if (existingUsername) return response.badRequest('auth.usernameExists')


                if (userObject.avatar) {
                    // TODO Read NOTE below
                    // ****************************************** NOTE ******************************************
                    // Depending of your logic, you will want to download this avatar from social media, and
                    // save it locally to your server. Maybe you will have model for files... or whatever, so
                    // please edit this as you wish.
                    // ****************************************** **** ******************************************
                }

                user = await User.create({
                    username: allParams.username,
                    firstname: userObject.firstname,
                    lastname: userObject.lastname,
                    email: userObject.email,
                    language: locale,
                    terms_accepted: allParams.terms_accepted,
                    terms_ip: Helper.getIp(request)
                })

                // we just created new social user, they are automatically validated (no need for email validation)
                // so... let's send that welcome email to them
                Event.fire('user::validated', {user})
            }

            // now just create account and we are ready to go
            await Account.create({
                user_id: user.id,
                type: params.network,
                social_id: userObject.social_id,
                email: userObject.email,
                validated: true // it's always validated if oAuth was success
            })
        }

        // whatever happens... new user, or existing one... generate token for him
        const token = await UserRepository.generateUserTokens(auth, user)  // you can add token payload if needed as third parameter


        response.ok({
            user,
            token: token.token,
            refreshToken: token.refreshToken
        })
    }

    async refreshToken({request, auth}) {
        const user = await UserRepository.useRefreshToken(request.input('refreshToken'))
        return UserRepository.generateUserTokens(auth, user)
    }
    
    async validateEmail({response, auth, token}) {
        const user = await UserRepository.validateEmail(token.mailValidation)
        const newToken = await UserRepository.generateUserTokens(auth, user)
        
        response.ok({
            user,
            token: newToken.token,
            refreshToken: newToken.refreshToken
        })
    }


    async resendValidation({request, response}) {
        await UserRepository.resendValidation(request.input('username'))
        return response.ok('auth.emailValidationResent')
    }


    async forgotPassword({request, response}) {
        await UserRepository.forgotPassword(request.input('username'))
        return response.ok('auth.forgotPasswordTokenSent')
    }


    async resetPassword({request, response, token, auth}) {
        const allParams = request.post()
        if (!token.passwordReset) return response.unauthorized()
        const user = await UserRepository.resetPassword(token.passwordReset)
        const newToken = await UserRepository.generateUserTokens(auth, user)

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
}


module.exports = AuthController
