'use strict'
const AttributeTraitBase = use('App/Models/Traits/Attributes/AttributeTraitBase')

class AddAllowed extends AttributeTraitBase{
    register (Model, attributeConfig) {
        Model.required = AttributeTraitBase.whereTrueNameOnly(attributeConfig, 'required')
    }
}

module.exports = AddAllowed
