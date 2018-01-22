'use strict'

const User = use('App/Models/User')

const SocialAuth = use('App/Helpers/SocialAuth')
const {validate} = use('Validator')
const Hash = use('Hash')

class AuthController {

  async login({request, response, auth}) {

    const allParams = request.all()

    const rules = {
      username: 'required_without_any:email',
      email: 'required_without_any:username',
      password: 'required_with_any:username,email'
    }

    const validation = await validate(allParams, rules)

    if (validation.fails()) return response.badRequest()


    //
    const user = await User.query()
      .where('username', allParams.username)
      .first()

    if (!user) return response.notFound()

    // check pass
    const validPass = await Hash.verify(allParams.password, user.password)

    if (!validPass) return response.badRequest() // todo add language translations

    const token = await auth
      .withRefreshToken()
      .generate(user, {custom: 'payload'}) // todo remove custom payload

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



