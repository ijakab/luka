'use strict'

class AppSplit {
  register (Model) {
    Model.queryMacro('whereOrganization', function (id) {
        this.where('organization_id', id)
        return this
    })
  }
}

module.exports = AppSplit
