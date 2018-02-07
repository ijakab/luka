'use strict'

// this one checks token, and returns user so there is no need to call checkToken before

class GetUser {
  async handle(ctx, next) {

    // get and set user to context
    ctx.user = await ctx.auth.getUser()

    await next()
  }
}

module.exports = GetUser
