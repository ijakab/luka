'use strict'

// ****************************************** NOTE ******************************************
// If you are changing this file, be sure to check app/Exceptions/Handler.js too...
// ****************************************** **** ******************************************

const formatResponse = use('App/Helpers/FormatResponse')

class FormatResponseMiddleware {

    async handle({request, response, locale}, next) {

        // await everything downstream, if error happens, run formatter nevertheless (catch)
        await next()

        // after everything is finished, handle response logic upstream
        const lazyBody = response._lazyBody
        if (response.implicitEnd && lazyBody.method !== 'redirect') {
            const isMobile = request.header('x-is-mobile')

            // handle error 429 for too many attempts
            if (response.response.statusCode === 429) {
                lazyBody.content = 'error.tooManyRequests'
            }

            response[lazyBody.method](await formatResponse(lazyBody.content, isMobile, locale))
        }
    }
}

module.exports = FormatResponseMiddleware
