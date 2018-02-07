'use strict'
const Route = use('Route')

module.exports = Route.group(() => {

  /**
   * @api {get} /api/user/me Me
   * @apiGroup User
   *
   * @apiPermission JWT
   *
   * @apiDescription Get information about user who is bearing token
   *
   */
  Route.get('/me', 'UserController.me').middleware(['getUser'])

})

