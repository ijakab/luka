'use strict'

class UserController {

    async me({response, user}) {
        response.ok(user)
    }

}

module.exports = UserController
