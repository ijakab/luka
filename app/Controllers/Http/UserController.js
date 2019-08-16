'use strict'
const Hash = use('Hash')
const User = use('App/Models/User')

class UserController {

    async index({request, response, transform}) {
        // ****************************************** NOTE ******************************************
        // This method is mostly added just so nuxt starter can show few more things...
        // If you are going to have method like this... Create better search/order logic using
        // fulltext index or elastic or whatever :)
        // ****************************************** **** ******************************************

        const qs = request.get()

        let query = User.query()

        const {search, orderBy, order = 'asc'} = qs
        if (search) {
            query.where(function () {
                this.where('firstname', 'like', `%${search}%`)
                this.orWhere('lastname', 'like', `%${search}%`)
                this.orWhere('username', 'like', `%${search}%`)
            })
        }

        if (['created_at', 'updated_at', 'username'].includes(orderBy)) {
            query.orderBy(orderBy, order)
        }


        const users = await query.paginable(qs)

        response.ok(await transform.paginate(users, 'User'))
    }

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

        // save our user... then continue looking for pass change if needed
        await user.save()

        // if password was sent handle it...
        if (allParams.password) {
            const mainAccount = await user.fetchMainAccount()
            if (mainAccount) {
                // check current password
                if (!allParams.current_password || !await Hash.verify(allParams.current_password, mainAccount.password)) {
                    return response.badRequest('user.invalidCurrentPassword')
                }

                mainAccount.password = allParams.password
                await mainAccount.save()
            } else {
                // we need to create main account
                await user.accounts().create({
                    type: 'main',
                    email: user.email,
                    password: allParams.password,
                    validated: true // this user was already logged in, so his email is validated (social login)
                })
            }
        }

        return response.ok()
    }

}

module.exports = UserController
