'use strict'
const Database = use('Database')
const Hash = use('Hash')
const User = use('App/Models/User')

class UserController {

    async me({response, user, transform}) {
        response.ok(await transform.item(user, 'User'))
    }

    async update({request, response, user}) {
        const allParams = request.post() // in all params we will get password if sent..
        const allowedParams = User.getAllowedParams(allParams) // take all params for db

        // merge allowed params before validating
        user.merge(allowedParams)

        // validate newly merged model before writing to db but add password from alParams too if sent
        const validation = await User.validateParams({...allParams, ...user.$attributes})
        if (validation.fails()) return response.badRequest()

        // only update user if password is not sent...
        let trx // prepare trx if password was sent...
        if (!allParams.password) {
            await user.save()
        } else {
            // we also need to update password... so start transacting
            trx = await Database.beginTransaction()

            // first let's save our user
            await user.save(trx)

            const mainAccount = await user.fetchMainAccount()
            if (mainAccount) {
                // check current password
                if (!allParams.current_password || !await Hash.verify(allParams.current_password, mainAccount.password)) {
                    await trx.rollback()
                    return response.badRequest('user.invalidCurrentPassword')
                }

                mainAccount.password = allParams.password
                await mainAccount.save(trx)
            } else {
                // we need to create main account
                await user.accounts().create({
                    type: 'main',
                    email: user.email,
                    password: allParams.password,
                    validated: true // this user was already logged in, so his email is validated (social login)
                }, trx)
            }
        }

        if (trx) await trx.commit()
        return response.ok()
    }

}

module.exports = UserController
