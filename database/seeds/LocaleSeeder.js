'use strict'

const Locale = use('App/Models/Locale')

class LocaleSeeder {
  async run() {

    await Locale.createMany([
      // --- AUTH CONTROLLER --- //
      {
        locale: 'en',
        group: 'auth',
        item: 'emailExists',
        text: 'Email already exists'
      },
      {
        locale: 'en',
        group: 'auth',
        item: 'usernameExists',
        text: 'Username already exists'
      },
      {
        locale: 'en',
        group: 'auth',
        item: 'invalidPassword',
        text: 'Invalid password'
      },
      {
        locale: 'en',
        group: 'auth',
        item: 'userRegistered',
        text: 'Successfully registered! Please validate your email.'
      },
      {
        locale: 'en',
        group: 'auth',
        item: 'mailNotValidated',
        text: 'Please validate your email.'
      },
      {
        locale: 'en',
        group: 'auth',
        item: 'emailValidated',
        text: 'Email successfully validated!'
      },
      {
        locale: 'en',
        group: 'auth',
        item: 'emailAlreadyValidated',
        text: 'Email is already validated!'
      },
      {
        locale: 'en',
        group: 'auth',
        item: 'emailValidationResent',
        text: 'Email validation resent!'
      },
      // --- REGISTRATION EMAIL --- //
      {
        locale: 'en',
        group: 'email',
        item: 'registration.subject',
        text: 'Email validation'
      },
      {
        locale: 'en',
        group: 'email',
        item: 'registration.welcome',
        text: 'Welcome'
      },
      {
        locale: 'en',
        group: 'email',
        item: 'registration.validationLink.description',
        text: 'Please click here to validate your email address:'
      },
      {
        locale: 'en',
        group: 'email',
        item: 'registration.validationLink.title',
        text: 'VALIDATE EMAIL'
      },
      // --- RESEND VALIDATION EMAIL --- //
      {
        locale: 'en',
        group: 'email',
        item: 'resendValidation.subject',
        text: 'Email validation - resend'
      },
      {
        locale: 'en',
        group: 'email',
        item: 'resendValidation.hi',
        text: 'Hi'
      },
      // --- ERRORS --- //
      {
        locale: 'en',
        group: 'error',
        item: 'tokenExpired',
        text: 'Token has expired'
      },
      {
        locale: 'en',
        group: 'error',
        item: 'invalidToken',
        text: 'Token is invalid'
      }
    ])

  }
}

module.exports = LocaleSeeder
