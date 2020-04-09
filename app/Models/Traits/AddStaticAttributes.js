'use strict'

class AppSplit {
    register (Model) {
        if(Model._AttributeConfig && typeof Model._AttributeConfig === 'string') Model.AttributeConfig = use(Model._AttributeConfig)
    }
}

module.exports = AppSplit
