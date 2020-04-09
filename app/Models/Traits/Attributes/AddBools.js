'use strict'
const AttributeTraitBase = use('App/Models/Traits/Attributes/AttributeTraitBase')

class AddAllowed extends AttributeTraitBase{
    register (Model, attributeConfig) {
        Model.booleans = AttributeTraitBase.whereTrueNameOnly(attributeConfig, 'isBoolean')
    }
}

module.exports = AddAllowed
