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

    // edit your local params for email as you wish
    await mailService.send('emails.registration', account.email, {
      locale: user.language,
      user: {
        fullName: user.fullName
      },
      validateUrl: `${VALIDATE_EMAIL_URL}?token=${mailToken}`
    })

  }

}
