'use strict'

const Route = use('Route')

// routing goes here:
_requireRoutes('Auth').prefix('api/auth')
_requireRoutes('User').prefix('api/user')


// --- PRIVATE
function _requireRoutes(group) {
  return require(`../app/Routes/${group}`)
}
