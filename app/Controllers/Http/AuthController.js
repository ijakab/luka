'use strict'

const User = use('App/Models/User')
const Account = use('App/Models/Account')

const SocialAuth = use('App/Services/SocialAuth')
const {validate, sanitize, is} = use('Validator')
const Hash = use('Hash')
const Event = use('Event')

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

    // first we check if this email already exists in another account (fb, google, etc)
    const existingAccount = await Account.findBy('email', allParams.email)

    // also try to fetch user profile of found account if any
    let user = existingAccount && await existingAccount.user().fetch()

    // if there is a user, and he has main account... we can't create duplicate then
    if (user && existingAccount.type === 'main') return response.badRequest('auth.emailExists')

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
    const account = await Account.create({
      user_id: user.id,
      type: 'main',
      email: allParams.email,
      password: allParams.password,
      validated: false // set validated to false, email needs to be checked for main account...
    })

    // fire an event that new user was created... we need to send welcome email, etc.
    Event.fire('user::register', {account})

    response.ok('auth.userRegistered')
  }


  async login({request, response, auth}) {

    const allParams = request.post()

    const validation = await validate(allParams, {
      username: 'required_without_any:email',
      email: 'required_without_any:username|email',
      password: 'required_with_any:username,email'
    })

    if (validation.fails()) return response.badRequest()

    // find user by username or email, and get his main account
    const user = await User.query()
      .where({
        [allParams.username ? 'username' : 'email']: allParams.username || allParams.email
      })
      .first()

    // get main account info if we found user at all
    const mainAccount = user && await user.getMainAccount()

    if (!mainAccount) return response.notFound()

    if (!mainAccount.validated) return response.forbidden('auth.mailNotValidated')

    // check pass
    const validPass = await Hash.verify(allParams.password, mainAccount.password)

    if (!validPass) return response.badRequest('auth.invalidPassword')

    // generate tokens
    const token = await auth
      .withRefreshToken()
      .generate(user) // you can add custom payload as second input to generate(u,payload)...

    response.ok({user, token: token.token, refreshToken: token.refreshToken})
  }


  async socialLogin({request, response, params}) {

    const accessToken = request.input('token')
    const socialHandler = SocialAuth[params.network]

    if (!socialHandler) return response.notFound()

    const socialUser = await socialHandler(accessToken)


    // todo check if user is existing, connect profiles and give JWT token...
    // search users by email or that social media id? todo


    return response.ok(socialUser)

  }

  async refreshToken({request, response, auth}) {

    // todo ... think about this... every time we get new db entry, should we destroy old refresh token?
    // or should we just skip generation of newRefreshToken below? ???

    const refreshToken = request.input('token')

    if(!refreshToken) return response.badRequest()

    const newToken = await auth
      .newRefreshToken()
      .generateForRefreshToken(refreshToken)

    response.ok({token: newToken.token, refreshToken: newToken.refreshToken})
  }


  async validateEmail({request, response, token}) {

    // first check if this valid token has account info inside
    if (!token.mailValidation) return response.unauthorized()

    await Account
      .query()
      .where('id', token.mailValidation)
      .update({validated: true})

    response.ok('auth.emailValidated')

  }


  async resendValidation({request, response}) {

    const resendEmail = request.input('resendEmail')

    // check if email was sent
    if (!is.email(resendEmail)) return response.badRequest()

    // find account for this email
    const account = await Account.findBy('email', resendEmail)

    // we are sending email validated on unknown email on purpose, so no one can guess which email exists in db
    if (!account || account.validated) return response.badRequest('auth.emailAlreadyValidated')

    // send validation email in async way
    Event.fire('user::resendValidation', {account})

    response.ok('auth.emailValidationResent')

  }

}


module.exports = AuthController
