'use strict'

const formatResponse = use('App/Helpers/FormatResponse')

class FormatResponseMiddleware {

    async handle({response, locale}, next) {

        // await everything downstream, if error happens, run formatter nevertheless (catch)
        await next()

        // after everything is finished, handle response logic upstream
        const lazyBody = response._lazyBody


        if (lazyBody.method !== 'redirect') {

            // handle error 429 for too many attempts
            if (response.response.statusCode === 429) {
                lazyBody.content = 'error.tooManyRequests'
            }

            response[lazyBody.method](await formatResponse(lazyBody.content, locale))
        }
    }
}


module.exports = FormatResponseMiddleware
