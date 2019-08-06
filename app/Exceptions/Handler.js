'use strict'

const BaseExceptionHandler = use('BaseExceptionHandler')

const formatResponse = use('App/Helpers/FormatResponse')

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {

    async handle(error, {request, response, locale}) {

        // ****************************************** NOTE ******************************************
        // This guy uses similar logic as global middleware HandleResponse.
        // Is you are updating HandleResponse... be sure to check this one too...
        // When Exception is thrown, global middleware is not called, so this guy needs format logic too
        // ****************************************** **** ******************************************

        // translate some default errors
        if (error.name === 'Error') error.name = error.message // fallback for non named errors

        switch (error.name) {
            case 'ForbiddenException':
                error.message = 'error.forbidden'
                break
            case 'ModelNotFoundException': // findOrFail handle...
                error.message = 'error.notFound'
                break
            case 'TokenExpiredError':
            case 'ExpiredJwtToken':
                error.message = 'error.tokenExpired'
                error.status = 401
                break
            case 'InvalidJwtToken':
            case 'JsonWebTokenError':
            case 'InvalidRefreshToken':
                error.message = 'error.invalidToken'
                error.status = 400
                break
        }

        switch (error.code) {
            case 'ER_NO_REFERENCED_ROW':
            case 'ER_NO_REFERENCED_ROW_2':
                error.message = 'error.invalidRelation'
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
