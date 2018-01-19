'use strict'

const Route = use('Route')

function requireRoutes(group) {
  return require(`../app/Routes/${group}`)
}


// routing goes here:

requireRoutes('Auth').prefix('api/auth')


