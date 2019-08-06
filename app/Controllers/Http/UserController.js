'use strict'
const Database = use('Database')
const User = use('App/Models/User')

class UserController {

    async me({response, user, transform}) {
        response.ok(await transform.item(user, 'User'))
    }

    async update({request, response, user}) {
        const allParams = User.getAllowedParams(request.post())

        // merge allowed params before validating
        user.merge(allParams)

        // validate newly merged model before writing to db
        const validation = await User.validate(user.$attributes)
        if (validation.fails()) return response.badRequest()

        // only update user if password is not sent...
        if (!allParams.password) {
            await user.save()
        } else {
            // we also need to update password... so start transacting
            await Database.transaction(async (trx) => {
                // first let's save our user
                await user.save(trx)

                const mainAccount = await user.fetchMainAccount()
                if (mainAccount) {
                    // check current password
                    if (!allParams.current_password) return response.badRequest()

                    const validPass = await Hash.verify(allParams.current_password, mainAccount.password)
                    if (!validPass) return response.badRequest('user.invalidCurrentPassword')

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
            })
        }


        return response.ok()
    }

}

module.exports = UserController
