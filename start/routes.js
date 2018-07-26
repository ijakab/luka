'use strict'

const Route = use('Route')

// routing goes here:
_requireRoutes('Auth').prefix('api/auth').middleware(['throttle:12']) // allow 12 requests per minute for all routes in Auth controller
_requireRoutes('User').prefix('api/user')


// --- PRIVATE
function _requireRoutes(group) {
    return require(`../app/Routes/${group}`)
}
