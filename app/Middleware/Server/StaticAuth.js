/*
 *
 * Server middleware for Basic Auth on top of statically served assets
 *
 * Add it on list of server middleware before Static middleware inside kernel.js
 *
 const serverMiddleware = [
 'App/Middleware/Server/StaticAuth',    <----------
 'Adonis/Middleware/Static',
 'Adonis/Middleware/Cors'
 ]
 *
 * Then add configuration to auth.js configuration like:
 *
 staticAuth: {
 realm: 'My Documentation',
 username: 'admin',
 password: 'mephaDocs',
 protectedUrls: ['/docs']
 }

 That's it :)
 *
 */

'use strict'

const auth = use('basic-auth')
const config = use('Adonis/Src/Config').get('auth.staticAuth')
const validConfig = config && config.protectedUrls.length

class StaticAuth {
    async handle({request, response}, next) {

        // if there is no valid config... skip this middleware
        if (!validConfig) return await next()

        // check if currently visited url is matching protectedUrls
        if (!request.match(config.protectedUrls)) return await next()

        // access native node request/response
        const req = request.request
        const res = response.response

        // gather credentials
        const credentials = auth(req)

        if (!credentials || credentials.name !== config.username || credentials.pass !== config.password) {
            res.statusCode = 401
            // send Basic Auth header so browser prompts user for user/pass
            res.setHeader('WWW-Authenticate', `Basic realm="${config.realm || 'Protected Area'}"`)
            return res.end('Access denied')
        }

        await next()
    }
}

module.exports = StaticAuth
