'use strict'

const UserTransformer = use('App/Transformers/User')

class UserController {

    async me({response, user, transform}) {
        response.ok(await transform.item(user, UserTransformer))
    }

}

module.exports = UserController
