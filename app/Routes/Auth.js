'use strict'
const Route = use('Route')

module.exports = Route.group(() => {


  /**
   * @api {post} /api/auth/login Login
   * @apiGroup Auth
   *
   * @apiDescription Login route. Call this to fetch JWT access token together with refresh token.
   *
   * @apiParam {string} [username] Send username or email
   * @apiParam {string} [email] Send username or email
   * @apiParam {string} password Password for this username/email
   *
   * @apiSuccess {String} token JWT token used for authorization
   * @apiSuccess {String} refreshToken JWT token used for authorization
   * @apiSuccess {Object} user  User object
   * @apiSuccess {String} user.id
   * @apiSuccess {String} user.fullName
   * @apiSuccess {String} user.email
   * TODO add other user attributes here
   */
  Route.post('/login', 'AuthController.login')


  /**
   * @api {post} /api/auth/:network Social login
   * @apiGroup Auth
   *
   * @apiDescription Response is same as standard login. This route automatically links social network profile with
   * users account if there is one. If there is no user account, then new account will be created for this user.
   *
   * @apiParam {routeParam} network Name of social network you are using (facebook, google, linkedIn)
   * @apiParam {string} accessToken Token you got after successful oAuth to one of social networks
   *
   */
  Route.post('/:network', 'AuthController.socialLogin')

})

