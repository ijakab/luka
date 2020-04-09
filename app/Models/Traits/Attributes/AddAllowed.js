'use strict'
const AttributeTraitBase = use('App/Models/Traits/Attributes/AttributeTraitBase')

class AddAllowed extends AttributeTraitBase{
    register (Model, attributeConfig) {
        Model.allowed = AttributeTraitBase.whereTrueNameOnly(attributeConfig, 'userWritable')
    }
}

module.exports = AddAllowed
