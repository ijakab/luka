'use strict'

// routing goes here:
_requireRoutes('Auth').prefix('api/auth').middleware(['throttle:15']) // allow 15 requests per minute for all routes in Auth controller
_requireRoutes('User').prefix('api/users')
_requireRoutes('Song').prefix('api/song')
_requireRoutes('Playlist').prefix('api/playlist')

// --- PRIVATE
function _requireRoutes(group) {
    return require(`../app/Routes/${group}`)
}
