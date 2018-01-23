'use strict'

const Hash = use('Hash')

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
  }
}
