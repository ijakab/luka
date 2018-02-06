'use strict'

const mailService = use('App/Services/Mail')
const jwt = use('jsonwebtoken')
const Env = use('Env')

const APP_KEY = Env.get('APP_KEY')
const VALIDATE_EMAIL_URL = Env.get('VALIDATE_EMAIL_URL')

module.exports = {

  register: async ({user, account}) => {

    // generate validate token for email
    const mailToken = await jwt.sign({
      mailValidation: account.id
    }, APP_KEY, {
      expiresIn: '1 day'
    })

    // first param is email subject. You can use translation logic here also, or just write your own subject.
    await mailService.send('email.registration', account.email, {
      // edit your local params for email as you wish
      locale: user.language,
      user: {
        fullName: user.fullName
      },
      validateUrl: `${VALIDATE_EMAIL_URL}?token=${mailToken}`
    })

  },


  resendValidation: async({user, account}) => {

    // generate validate token for email
    const mailToken = await jwt.sign({
      mailValidation: account.id
    }, APP_KEY, {
      expiresIn: '1 day'
    })


    await mailService.send('email.resendValidation', account.email, {
      // edit your local params for email as you wish
      locale: user.language,
      user: {
        fullName: user.fullName
      },
      validateUrl: `${VALIDATE_EMAIL_URL}?token=${mailToken}`
    })


  }

}
