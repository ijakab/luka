'use strict'

// use this middleware when you just need to be sure that user has valid token
// you can also use this if you only need users id or any data inside token payload w/o need to query db

// this is handy for email validation, password reset logic or any custom jwt token solution

class CheckToken {
    async handle(ctx, next) {

        // set token extracted payload to context if it's valid and not expired
        ctx.token = await ctx.auth._verifyToken(ctx.auth.getAuthHeader())

        await next()
    }
}

module.exports = CheckToken
