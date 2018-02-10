'use strict'

const formatResponse = use('App/Services/FormatResponse')
const {decode} = use('jsonwebtoken')
const _ = use('lodash')

class FormatResponseMiddleware {

  async handle(ctx, next) {

    // await everything downstream, if error happens, run formatter nevertheless (catch)
    await next()

    // after everything is finished, handle response logic upstream
    const lazyBody = ctx.response._lazyBody


    // if token is present inside request, try to get user locale from token instead of guessing depending of request
    let locale, token
    if (ctx.token) {
      locale = _.get(ctx.token, 'data.language')
    } else if (ctx.user) {
      locale = ctx.user.language
    } else if (token = ctx.auth.getAuthHeader()) { // one '=' is intentional!
      locale = _.get(decode(token), 'data.language')
    }

    if (lazyBody.method !== 'redirect') {

      // handle error 429 for too many attempts
      if (lazyBody.method === 'tooManyRequests') {
        lazyBody.content = 'error.tooManyRequests'
      }

      ctx.response[lazyBody.method](await formatResponse(lazyBody.content, locale || ctx.locale))
    }
  }
}


module.exports = FormatResponseMiddleware
