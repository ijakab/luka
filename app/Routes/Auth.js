'use strict'
const Route = use('Route')

module.exports = Route.group(() => {

  Route.post('/login', 'AuthController.login')

  Route.post('/:network', 'AuthController.socialLogin')

})

