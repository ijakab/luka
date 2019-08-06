'use strict'
const Route = use('Route')

module.exports = Route.group(() => {

    /**
     * @api {get} /api/users/me Me
     * @apiGroup User
     *
     * @apiPermission JWT
     *
     * @apiDescription Get information about user who is bearing token
     *
     */
    Route.get('/me', 'UserController.me').middleware(['getUser'])

    /**
     * @api {patch} /api/users/me Update user
     * @apiGroup User
     * @apiVersion 1.0.0
     *
     * @apiPermission JWT
     *
     * @apiDescription Update user details/password
     *
     * @apiParam {string} [firstname] Name of user
     * @apiParam {string} [lastname] Surname of user
     * @apiParam {string} [password] Password for this user (rule: min:6)
     * @apiParam {string} [password_confirmation] Repeated password
     * @apiParam {string} [current_password] If password is being changed, you need to provide old pass if you have MAIN account type at all
     * @apiParam {string} [language] Language (rule: string|min:2|max:2)
     *
     */
    Route.patch('/me', 'UserController.update').middleware(['getUser'])

})

