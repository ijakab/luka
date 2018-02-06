'use strict'
const Route = use('Route')

module.exports = Route.group(() => {


  /**
   * @api {post} /api/auth/register Register
   * @apiGroup Auth
   *
   * @apiDescription Register route. After register user will be logged in automatically (response is the same as login route).
   * If user already logged in using social networks before and email is the same, accounts will be connected automatically.
   *
   * @apiParam {string} fullName Full name of a user
   * @apiParam {string} username Unique username
   * @apiParam {string} email Unique email
   * @apiParam {string} password Password for this user
   * @apiParam {string} passwordRepeat Repeated password
   *
   */
  Route.post('/register', 'AuthController.register')


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
   */
  Route.post('/login', 'AuthController.login')


  /**
   * @api {post} /api/auth/refreshToken Refresh token
   * @apiGroup Auth
   *
   * @apiDescription Refresh your expired JWT token.
   *
   * @apiParam {string} token JWT refresh token
   *
   */
  Route.post('/refreshToken', 'AuthController.refreshToken')


  /**
   * @api {post} /api/auth/validateEmail Validate email
   * @apiGroup Auth
   *
   * @apiDescription Validate email with JWT token sent on registration email
   *
   * @apiParam {string} token JWT token you got inside registration email
   *
   */
  // uses check token policy, because it parses custom JWT token created specifically for email reset
  Route.post('/validateEmail', 'AuthController.validateEmail').middleware(['checkToken'])


  /**
   * @api {post} /api/auth/resendValidation Resend validation
   * @apiGroup Auth
   *
   * @apiDescription If for some reason email validation should be resent. Hit this route.
   *
   * @apiParam {string} resendEmail Email of user you wish to resend validation to
   *
   */
  Route.post('/resendValidation', 'AuthController.resendValidation')

  // ****************************************** NOTE ******************************************
  // KEEP THIS GUY AT THE BOTTOM!
  // /:network route will conflict with other routes if you are not careful :)
  // ****************************************** **** ******************************************
  /**
   * @api {post} /api/auth/:network Social login
   * @apiGroup Auth
   *
   * @apiDescription Response is same as standard login. This route automatically links social network profile with
   * users account if there is one. If there is no user account, then new account will be created for this user.
   *
   * @apiParam {routeParam} network Name of social network you are using (facebook, google, linkedIn)
   * @apiParam {string} token Token you got after successful oAuth to one of social networks
   *
   */
  Route.post('/:network', 'AuthController.socialLogin')

})

