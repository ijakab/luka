'use strict'

const Env = use('Env')
const adminEmail = Env.getOrFail('ADMIN_EMAIL')
const adminPassword = Env.getOrFail('ADMIN_PASSWORD')
const UserRepository = use('App/Repositories/User')

class LocaleSeeder {
    async run() {
        await UserRepository.createUser({
            email: adminEmail,
            password: adminPassword,
            password_confirmation: adminPassword,
            username: 'admin',
            terms_accepted: true,
            role: 'superAdmin',
            firstname: 'Ivan',
            lastname: 'Jakab'
        }, true)
    }
}

module.exports = LocaleSeeder
