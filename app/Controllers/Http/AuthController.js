'use strict'

const User = use('App/Models/User')
const Account = use('App/Models/Account')

const {validate, sanitize, is} = use('Validator')
const Hash = use('Hash')
const Event = use('Event')
const shortId = require('shortid')

class AuthController {

  async register({request, response, auth, locale}) {

    const allParams = sanitize(request.post(), {
      email: 'normalize_email'
    })

    // email and username are not under unique:users rule because of auto merge account rule
    const validation = await validate(allParams, {
      fullName: 'required',
      username: 'required|string|min:3|max:20|regex:^[0-9a-zA-Z-_]+$', // allow alpha numeric + _- from 3 to 20 chars
      email: 'required|email',
      password: 'required|min:6',
      passwordRepeat: 'required|same:password',
      language: 'string|min:2|max:2'
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
        fullName: allParams.fullName,
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

    response.ok('auth.userRegistered')
  }


  async login({request, response, auth}) {

    const allParams = sanitize(request.post(), {
      email: 'normalize_email'
    })

    const validation = await validate(allParams, {
      username: 'required_without_any:email',
      email: 'email|required_without_any:username',
      password: 'required_with_any:username,email'
    })

    if (validation.fails()) return response.badRequest()

    const {user, mainAccount} = await this._findLoginUser(allParams)

    // if we don't have user in db, respond with badRequest invalid username or password instead of 404
    if (!mainAccount || !user) return response.badRequest('auth.invalidPasswordOrUsername')

    if (!mainAccount.validated) return response.forbidden('auth.mailNotValidated')

    // check pass
    const validPass = await Hash.verify(allParams.password, mainAccount.password)

    if (!validPass) return response.badRequest('auth.invalidPasswordOrUsername')

    // generate tokens
    const token = await auth
      .withRefreshToken()
      .generate(user, {language: user.language}) // we are adding user language to payload for response translations

    response.ok({user, token: token.token, refreshToken: token.refreshToken})
  }

  async socialRedirect({request, response, params, ally}) {

    if (request.input('linkOnly')) return response.ok({
      url: await ally.driver(params.network).getRedirectUrl()
    })

    await ally.driver(params.network).redirect()
  }

  async socialLogin({request, response, params, ally, auth, locale}) {

    const allParams = request.only(['token', 'accessToken'])

    const validation = await validate(allParams, {
      token: 'required_without_any:accessToken',
      accessToken: 'required_without_any:token'
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
      // user did't exist at all... we will create new user or connect accounts for him
      const userObject = sanitize({
        socialId: socialUser.getId(),
        network: params.network,
        fullName: socialUser.getName(),
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
        // we cant fetch username from social media, and it's require for our system... we need to generate it
        let newUsername = userObject.email.split('@')[0] // we take first part of email as username if possible

        // check if username that we are custom generating is already existing
        const usernameExisting = await User.query().where('username', newUsername).getCount()

        // username existed... so just create some random mambo-jumbo for this one
        if (usernameExisting) newUsername = `${shortId.generate()}-${newUsername}`

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
          username: newUsername,
          fullName: userObject.fullName,
          email: userObject.email,
          avatar: avatar,
          language: locale
        })
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
    const token = await auth
      .withRefreshToken()
      .generate(user, {language: user.language}) // we are adding user language to payload for response translations


    response.ok({user, token: token.token, refreshToken: token.refreshToken})
  }

  async refreshToken({request, response, auth}) {

    const refreshToken = request.input('token')

    if (!refreshToken) return response.badRequest()

    const newToken = await auth.generateForRefreshToken(refreshToken)

    response.ok({token: newToken.token, refreshToken: newToken.refreshToken})
  }


  async validateEmail({response, token}) {

    // first check if this valid token has account info inside
    if (!token.mailValidation) return response.unauthorized()

    // then update account by using account id from token
    await Account
      .query()
      .where('id', token.mailValidation)
      .update({validated: true})

    response.ok('auth.emailValidated')
  }


  async resendValidation({request, response}) {

    const resendEmail = request.input('resendEmail')

    // check if correct email format was sent
    if (!is.email(resendEmail)) return response.badRequest()

    // find main account for this email
    const mainAccount = await Account.query().where({'email': resendEmail, type: 'main'}).first()

    // we are sending email validated on unknown email on purpose, so no one can guess which email exists in db
    if (!mainAccount || mainAccount.validated) return response.badRequest('auth.emailAlreadyValidated')

    // send validation email in async way
    Event.fire('user::resendValidation', {mainAccount})

    response.ok('auth.emailValidationResent')
  }


  async forgotPassword({request, response}) {

    const allParams = sanitize(request.post(), {
      email: 'normalize_email'
    })

    const validation = await validate(allParams, {
      username: 'required_without_any:email',
      email: 'email|required_without_any:username',
    })

    if (validation.fails()) return response.badRequest()

    // find user and his main account
    const {user, mainAccount} = await this._findLoginUser(allParams)

    // if we don't find main account in our db, we will mimic OK response so no one knows that we don't have this user...
    if (!mainAccount || !user) return response.ok('auth.forgotPasswordTokenSent')


    // also check if this user validated his account at all
    if (!mainAccount.validated) return response.forbidden('auth.mailNotValidated')

    // send forgot password email in async way
    Event.fire('user::forgotPassword', {user, mainAccount})


    response.ok('auth.forgotPasswordTokenSent')
  }


  async resetPassword({request, response, token}) {

    const allParams = request.post()

    // first check if this valid token has account info inside
    if (!token.passwordReset) return response.unauthorized()

    const validation = await validate(allParams, {
      password: 'required|min:6',
      passwordRepeat: 'required|same:password'
    })

    if (validation.fails()) return response.badRequest()

    // find main account by id found inside token
    const mainAccount = await Account.find(token.passwordReset)

    if (!mainAccount) return response.notFound()

    // update password
    mainAccount.password = allParams.password
    await mainAccount.save()

    response.ok('auth.passwordReseted')
  }


  async accounts({response, user}) {

    const accounts = await user.accounts().fetch()

    response.ok(accounts)
  }


  // --- PRIVATE
  async _findLoginUser(allParams) {
    // find user by username or main account email
    let user, mainAccount

    if (allParams.username) {
      user = await User.findBy('username', allParams.username)
      mainAccount = user && await user.fetchMainAccount()
    } else {
      mainAccount = await Account.query().where({email: allParams.email, type: 'main'}).first()
      user = mainAccount && await mainAccount.user().fetch()
    }

    return {mainAccount, user}
  }

}


module.exports = AuthController
