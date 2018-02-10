'use strict'

const formatResponse = use('App/Services/FormatResponse')
const {decode} = use('jsonwebtoken')
const _ = use('lodash')

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler {

  async handle(error, ctx) {

    // ****************************************** NOTE ******************************************
    // This guy uses similar logic as global middleware HandleResponse.
    // Is you are updating HandleResponse... be sure to check this one too...
    // When Exception is thrown, global middleware is not called, so this guy needs format logic too
    // ****************************************** **** ******************************************

    // translate some default errors
    switch (error.name) {
      case 'TokenExpiredError':
      case 'ExpiredJwtToken':
        error.message = 'error.tokenExpired'
        error.status = 400
        break
      case 'InvalidJwtToken':
      case 'JsonWebTokenError':
      case 'InvalidRefreshToken':
        error.message = 'error.invalidToken'
        error.status = 400
        break
    }

    const status = error.status || error.statusCode || 500

    // if token is present inside request, try to get user locale from token instead of guessing depending of request
    let locale, token
    if (ctx.token) {
      locale = _.get(ctx.token, 'data.language')
    } else if (ctx.user) {
      locale = ctx.user.language
    } else if (token = ctx.auth.getAuthHeader()) { // one '=' is intentional!
      locale = _.get(decode(token), 'data.language')
    }

    ctx.response.status(status).send(await formatResponse(error, ctx.locale || locale))

  }

  /**
   * Report exception for logging or debugging.
   *
   * @method report
   *
   * @param  {Object} error
   * @param  {Object} options.request
   *
   * @return {void}
   */
  async report(error, {request}) {
  }
}

module.exports = ExceptionHandler
