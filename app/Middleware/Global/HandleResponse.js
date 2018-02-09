'use strict'

const formatResponse = use('App/Services/FormatResponse')

class FormatResponseMiddleware {

  async handle({response, locale}, next) {

    // await everything downstream, if error happens, run formatter nevertheless (catch)
    await next()

    // after everything is finished, handle response logic upstream
    if (response._lazyBody.method !== 'redirect') {

      // handle error 429 for too many attempts
      if(response._lazyBody.method === 'tooManyRequests') {
        response._lazyBody.content = 'error.tooManyRequests'
      }

      response[response._lazyBody.method](await formatResponse(response._lazyBody.content, locale))
    }
  }
}


module.exports = FormatResponseMiddleware
