'use strict'
const Route = use('Route')

module.exports = Route.group(() => {


    /**
     * @api {post} /api/auth/register Register
     * @apiGroup Auth
     *
     * @apiDescription After register user user will get email for email confirmation.
     * If user already logged in using social networks before and email is the same, accounts will be connected automatically.
     *
     * @apiParam {string} fullName Full name of a user
     * @apiParam {string} username Unique username (rule: string|min:3|max:20|regex:^[0-9a-zA-Z-_]+$)
     * @apiParam {string} email Unique email
     * @apiParam {string} password Password for this user (rule: min:6)
     * @apiParam {string} passwordRepeat Repeated password
     * @apiParam {string} [language=en] Language (rule: string|min:2|max:2)
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
    // uses check token policy, because it parses custom JWT token created specifically for email
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


    /**
     * @api {post} /api/auth/forgotPassword Forgot password
     * @apiGroup Auth
     *
     * @apiDescription Route that sends email with password reset link.
     *
     * @apiParam {string} [email] Email of user who wants to reset password
     * @apiParam {string} [username] Username of user who wants to reset password
     *
     */
    Route.post('/forgotPassword', 'AuthController.forgotPassword')


    /**
     * @api {post} /api/auth/resetPassword Reset password
     * @apiGroup Auth
     *
     * @apiDescription Route where you send password reset token together with new password
     *
     * @apiParam {string} token JWT token you got inside password reset email
     * @apiParam {string} password New password for this user (rule: min:6)
     * @apiParam {string} passwordRepeat Repeated password
     *
     */
    // uses check token policy, because it parses custom JWT token created specifically for email
    Route.post('/resetPassword', 'AuthController.resetPassword').middleware(['checkToken'])


    /**
     * @api {get} /api/auth/accounts List accounts
     * @apiGroup Auth
     *
     * @apiPermission JWT
     *
     * @apiDescription Route where you can see all registered accounts for this user.
     *
     */
    Route.get('/accounts', 'AuthController.accounts').middleware(['getUser'])


    // ****************************************** NOTE ******************************************
    // KEEP THIS GUYS AT THE BOTTOM!
    // /:network route will conflict with other routes if you are not careful :)
    // ****************************************** **** ******************************************

    /**
     * @api {get} /api/auth/:network/redirect oAuth redirect
     * @apiGroup Auth
     *
     * @apiDescription Redirects client to oAuth website where he needs to login on 3rd party service.
     * If only link to this oAuth site is needed, make sure to pass ?onlyLink=true as GET query param
     *
     * @apiParam {routeParam} network Name of social network you are using (facebook, google, linkedin)
     * @apiParam {string} [linkOnly=false] If true, server will return default response with oAuth url as url key
     * @apiParam {string} [redirectUrl=null] If demanding linkOnly you can pass redirect url
     *
     */
    Route.get('/:network/redirect', 'AuthController.socialRedirect')

    /**
     * @api {post} /api/auth/:network Social login
     * @apiGroup Auth
     *
     * @apiDescription Response is same as standard login. This route automatically links social network profile with
     * users account if there is one. If there is no user account, then new account will be created for this user.
     *
     * Before creating new account, API will send response with status 202 (Accepted) and accessToken meaning that everything went well
     * but username is needed to continue user account creation. Client should call this route again this time providing accessToken AND username
     *
     * Token (often call "code" instead of "token" in social responses) is acquired after /auth/:network/redirect
     * successful call on web or you'll get accessToken immediately if using mobile app social SDKs.
     *
     * @apiParam {routeParam} network Name of social network you are using (facebook, google, linkedin)
     * @apiParam {string} [token] Token you got after successful oAuth to one of social networks (this or accessToken is required)
     * @apiParam {string} [accessToken] If you are using mobile SDKs for social auth, you immediately get accessToken, so use this instead of token (this or token is required)
     * @apiParam {string} [username] When user is not existing, he will need username. This one is required after response with status 202 (Accepted) (rule: string|min:3|max:20|regex:^[0-9a-zA-Z-_]+$)
     *
     */
    Route.post('/:network', 'AuthController.socialLogin')
})

