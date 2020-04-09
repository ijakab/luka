'use strict'
const AttributeTraitBase = use('App/Models/Traits/Attributes/AttributeTraitBase')

class AddAllowed extends AttributeTraitBase{
    register (Model, attributeConfig) {
        Model.canSortBy = AttributeTraitBase.whereTrueNameOnly(attributeConfig, 'canSortBy')
        Model.canFilterBy = AttributeTraitBase.whereTrueNameOnly(attributeConfig, 'canFilterBy')
        Model.canSearchBy = AttributeTraitBase.whereTrueNameOnly(attributeConfig, 'canSearchBy')
        Model.addToResponse = AttributeTraitBase.whereTrueNameOnly(attributeConfig, 'addToResponse')
    }
}

module.exports = AddAllowed
