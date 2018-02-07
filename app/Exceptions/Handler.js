'use strict'

const formatResponse = use('App/Services/FormatResponse')

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle
   *
   * @method handle
   *
   * @param  {Object} error
   * @param  {Object} options.request
   * @param  {Object} options.response
   *
   * @return {void}
   */
  async handle(error, {response, locale}) {

    // translate some default errors
    switch (error.name) {
      case 'TokenExpiredError':
      case 'ExpiredJwtToken':
        error.message = 'error.tokenExpired'
        break
      case 'InvalidJwtToken':
      case 'JsonWebTokenError':
      case 'InvalidRefreshToken':
        error.message = 'error.invalidToken'
        break
    }

    const status = error.status || error.statusCode || 500

    response.status(status).send(await formatResponse(error, locale))

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
