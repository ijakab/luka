'use strict'

class CheckToken {
  async handle(ctx, next) {

    // set token to context if it's valid and not expired
    ctx.token = await ctx.auth._verifyToken(ctx.auth.getAuthHeader())

    await next()
  }
}

module.exports = CheckToken
