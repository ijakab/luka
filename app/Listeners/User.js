'use strict'

const mailService = use('App/Services/Mail')
const jwt = use('jsonwebtoken')
const Env = use('Env')

const APP_KEY = Env.get('APP_KEY')
const VALIDATE_EMAIL_URL = Env.get('VALIDATE_EMAIL_URL')
const RESET_PASSWORD_EMAIL_URL = Env.get('RESET_PASSWORD_EMAIL_URL')

module.exports = {

    register: async ({user, mainAccount}) => {

        // fetch mainAccount user if not sent
        user = user || await mainAccount.user().fetch()

        // generate validate token for email
        const mailToken = await jwt.sign({
            mailValidation: mainAccount.id
        }, APP_KEY, {
            expiresIn: '1 day'
        })

        // first param is email subject. You can use translation logic here also, or just write your own subject.
        await mailService.send('email.registration', mainAccount.email, {
            // edit your local params for email as you wish
            locale: user.language,
            user: {
                fullName: user.fullName
            },
            validateUrl: `${VALIDATE_EMAIL_URL}?token=${mailToken}`
        })

    },


    validated: async ({user}) => {

        // first param is email subject. You can use translation logic here also, or just write your own subject.
        await mailService.send('email.welcomeUser', user.email, {
            // edit your local params for email as you wish
            locale: user.language,
            user: {
                fullName: user.fullName
            }
        })

    },


    resendValidation: async ({user, mainAccount}) => {

        // fetch mainAccount user if not sent
        user = user || await mainAccount.user().fetch()

        // generate validate token for email
        const mailToken = await jwt.sign({
            mailValidation: mainAccount.id
        }, APP_KEY, {
            expiresIn: '1 day'
        })


        await mailService.send('email.resendValidation', mainAccount.email, {
            // edit your local params for email as you wish
            locale: user.language,
            user: {
                fullName: user.fullName
            },
            validateUrl: `${VALIDATE_EMAIL_URL}?token=${mailToken}`
        })


    },


    forgotPassword: async ({user, mainAccount}) => {

        // fetch mainAccount user if not sent
        user = user || await mainAccount.user().fetch()

        // generate validate token for email
        const mailToken = await jwt.sign({
            passwordReset: mainAccount.id
        }, APP_KEY, {
            expiresIn: '15 minutes'
        })


        await mailService.send('email.forgotPassword', mainAccount.email, {
            // edit your local params for email as you wish
            locale: user.language,
            user: {
                fullName: user.fullName
            },
            resetUrl: `${RESET_PASSWORD_EMAIL_URL}?token=${mailToken}`
        })


    }

}
