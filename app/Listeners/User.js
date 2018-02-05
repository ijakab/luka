'use strict'

const mailService = use('App/Services/Mail')

module.exports = {

  register: async (data) => {



    await mailService.send('emails.registration', data.user.email, {
      locale: data.user.language,
      user: data.user,
      account: data.account
    })

  }

}
