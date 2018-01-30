'use strict'

const User = use('App/Models/User')
const Account = use('App/Models/Account')

const SocialAuth = use('App/Services/SocialAuth')
const {validate, sanitize} = use('Validator')
const Hash = use('Hash')
const Event = use('Event')

const _ = use('lodash')

class AuthController {

  async register({request, response, auth, locale}) {

    const allParams = sanitize(request.post(), {
      email: 'normalize_email:!rd'
    })

    // email and username are not under unique:users rule because of auto merge account rule
    const validation = await validate(allParams, {
      fullName: 'required',
      username: 'required|string|min:3|max:20|regex:^[0-9a-zA-Z-_]+$', // allow alpha numeric + _- from 3 to 20 chars
      email: 'required|email',
      password: 'required|min:6',
      passwordRepeat: 'required|same:password'
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
        email: allParams.email
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

    // ****************************************** NOTE ******************************************
    // depending of your app... you can login user now, or demand him to activate email...
    // in this starter app we are allowing NOT activated users to login also...
    // ****************************************** **** ******************************************

    // finally login this guy
    const token = await auth
      .withRefreshToken()
      .generate(user) // you can add custom payload as second input to generate(u,payload)...


    // fire an event that new user was created... we need to send welcome email, etc.
    Event.fire('user::register', {
      user: user.toJSON(),
      account: account.toJSON()
    })

    response.ok({user, token: token.token, refreshToken: token.refreshToken})
  }


  async login({request, response, auth}) {

    const allParams = request.post()

    const validation = await validate(allParams, {
      username: 'required_without_any:email',
      email: 'required_without_any:username|email',
      password: 'required_with_any:username,email'
    })

    if (validation.fails()) return response.badRequest()

    // ****************************************** NOTE ******************************************
    // add your own logic if you want to disallow users to login without verified email in main account
    // in this starter app we are allowing NOT activated users to login also...
    // ****************************************** **** ******************************************

    // find user by username or email, and get his main account
    const user = await User.query()
      .where({
        [allParams.username ? 'username' : 'email']: allParams.username || allParams.email
      })
      .with('accounts', (builder) => {
        builder.where('type', 'main')
      })
      .first()

    // get main account info
    const userAccount = user && _.first(user.getRelated('accounts').rows)

    if (!userAccount) return response.notFound()

    // check pass
    const validPass = await Hash.verify(allParams.password, userAccount.password)

    if (!validPass) return response.badRequest('auth.invalidPassword')

    // generate tokens
    const token = await auth
      .withRefreshToken()
      .generate(user) // you can add custom payload as second input to generate(u,payload)...

    response.ok({user, token: token.token, refreshToken: token.refreshToken})
  }


  async socialLogin({request, response, params}) {

    const accessToken = request.input('accessToken')

    const socialUser = await SocialAuth[params.network](accessToken)


    // todo check if user is existing, connect profiles and give JWT token...
    // search users by email or that social media id? todo


    return response.ok(socialUser)

  }

  async refreshToken({request, response}) {

    const refreshToken = request.input('refreshToken')

    await auth
      .newRefreshToken()
      .generateForRefreshToken(refreshToken)
  }

}


module.exports = AuthController
