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
        item: 'emailOrUsernameNotFound',
        text: 'User with this email or username is not existing'
      },
      {
        locale: 'en',
        group: 'auth',
        item: 'mainAccountNotFound',
        text: 'User is not registered with his main account (try social media login)'
      },
      {
        locale: 'en',
        group: 'auth',
        item: 'invalidPasswordOrUsername',
        text: 'Invalid password or username'
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
      {
        locale: 'en',
        group: 'auth',
        item: 'forgotPasswordTokenSent',
        text: 'Reset password email sent!'
      },
      {
        locale: 'en',
        group: 'auth',
        item: 'passwordReseted',
        text: 'Password was changed successfully!'
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
      // --- FORGOT PASSWORD EMAIL --- //
      {
        locale: 'en',
        group: 'email',
        item: 'forgotPassword.subject',
        text: 'Password reset'
      },
      {
        locale: 'en',
        group: 'email',
        item: 'forgotPassword.resetLink.description',
        text: 'If you demanded password reset for your account, please reset your password here:'
      },
      {
        locale: 'en',
        group: 'email',
        item: 'forgotPassword.resetLink.title',
        text: 'RESET PASSWORD'
      },
      // --- ERRORS --- //
      {
        locale: 'en',
        group: 'error',
        item: 'notFound',
        text: 'Record not found'
      },
      {
        locale: 'en',
        group: 'error',
        item: 'tooManyRequests',
        text: 'Too many attempts... Slow down'
      },
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
