'use strict'

const SocialAuth = use('App/Helpers/SocialAuth')

class AuthController {

  async login({params, ally}) {

    return {todo: 123}

  }


  async socialLogin({request, params}) {

    const socialUser = await SocialAuth[params.network](request.input('accessToken'))

    return socialUser

  }

}


module.exports = AuthController



