'use strict'

const formatResponse = use('App/Services/FormatResponse')

class FormatResponseMiddleware {

  async handle({response, locale}, next) {

    // await everything downstream, if error happens, run formatter nevertheless (catch)
    await next()
    // after everything is finished, handle response logic upstream

    response[response._lazyBody.method](await formatResponse(response._lazyBody.content, locale))
  }
}


module.exports = FormatResponseMiddleware
