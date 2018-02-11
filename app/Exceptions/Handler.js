'use strict'

const BaseExceptionHandler = use('BaseExceptionHandler')

const formatResponse = use('App/Services/FormatResponse')

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {

  async handle(error, {response, locale}) {

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
