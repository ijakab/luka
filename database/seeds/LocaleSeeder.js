'use strict'

const Locale = use('App/Models/Locale')

class LocaleSeeder {
    async run() {

        const translations = {
            // USER CONTROLLER
            'user.invalidCurrentPassword': {
                en: 'Your current password is not correct!'
            },
            // --- AUTH CONTROLLER --- //
            'auth.emailExists': {
                en: 'Email already exists'
            },
            'auth.acceptTerms': {
                en: 'Please accept terms'
            },
            'auth.usernameExists': {
                en: 'Username already exists'
            },
            'auth.emailOrUsernameNotFound': {
                en: 'User with this email or username is not existing'
            },
            'auth.mainAccountNotFound': {
                en: 'User is not registered with his main account (try social media login)'
            },
            'auth.invalidPasswordOrUsername': {
                en: 'Invalid password or username'
            },
            'auth.userRegistered': {
                en: 'Successfully registered! Please validate your email.'
            },
            'auth.mailNotValidated': {
                en: 'Please validate your email.'
            },
            'auth.emailValidated': {
                en: 'Email successfully validated!'
            },
            'auth.emailAlreadyValidated': {
                en: 'Email is already validated!'
            },
            'auth.emailValidationResent': {
                en: 'Email validation resent!'
            },
            'auth.forgotPasswordTokenSent': {
                en: 'Reset password email sent!'
            },
            'auth.passwordReseted': {
                en: 'Password was changed successfully!'
            },
            'auth.socialLoginProvideUsername': {
                en: 'Please provide your username'
            },
            // --- EMAIL SUBJECTS --- //
            'email.registration.subject': {
                en: 'Email validation'
            },
            'email.resendValidation.subject': {
                en: 'Email validation - resend'
            },
            'email.welcomeUser.subject': {
                en: 'Welcome!'
            },
            'email.forgotPassword.subject': {
                en: 'Password reset'
            },
            // --- ERRORS --- //
            'error.notFound': {
                en: 'Record not found'
            },
            'error.invalidRelation': {
                en: 'Unknown relation'
            },
            'error.tooManyRequests': {
                en: 'Too many attempts... Slow down'
            },
            'error.tokenExpired': {
                en: 'Token has expired'
            },
            'error.invalidToken': {
                en: 'Token is invalid'
            }
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        let mappedTranslations = []

        for (let key in translations) {

            const splittedKey = key.split('.')

            const group = splittedKey.shift()
            const item = splittedKey.join('.')

            for (let locale of Object.keys(translations[key])) {
                mappedTranslations.push({
                    locale,
                    group,
                    item,
                    text: translations[key][locale]
                })
            }

        }

        await Locale.createMany(mappedTranslations)

    }
}

module.exports = LocaleSeeder