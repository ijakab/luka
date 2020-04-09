'use strict'
const keyBy = require('lodash/keyBy')

class AddAllowed{
    register (Model) {
        Model.keyedAttributeConfig = keyBy(Model.AttributeConfig, 'name')
    }
}

module.exports = AddAllowed
