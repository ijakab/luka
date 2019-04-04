'use strict'

class UserController {

    async me({response, user, transform}) {
        response.ok(await transform.item(user, 'User'))
    }

}

module.exports = UserController
