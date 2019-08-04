'use strict'

const Route = use('Route')

// routing goes here:
_requireRoutes('Auth').prefix('api/auth').middleware(['throttle:15']) // allow 15 requests per minute for all routes in Auth controller
_requireRoutes('User').prefix('api/user')


// --- PRIVATE
function _requireRoutes(group) {
    return require(`../app/Routes/${group}`)
}
