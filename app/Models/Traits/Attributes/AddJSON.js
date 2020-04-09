'use strict'
const AttributeTraitBase = use('App/Models/Traits/Attributes/AttributeTraitBase')

class AddAllowed extends AttributeTraitBase{
    register (Model, attributeConfig) {
        Model.JSONFields = AttributeTraitBase.whereTrueNameOnly(attributeConfig, 'isJSON')
    }
}

module.exports = AddAllowed
