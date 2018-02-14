'use strict'

const Hash = use('Hash')

const Token = use('App/Models/Token')

const AccountHook = module.exports = {}

/**
 * Hash using password as a hook.
 *
 * @method
 *
 * @param  {Object} accountInstance
 *
 * @return {void}
 */
AccountHook.hashPassword = async (accountInstance) => {

    if (accountInstance.password) {
        accountInstance.password = await Hash.make(accountInstance.password)

        // also if this is update of existing, invalidate tokens by deleting them
        if (accountInstance.$persisted) {
            await Token.query().where({user_id: accountInstance.user_id, is_revoked: false}).delete()
        }

    }
}
