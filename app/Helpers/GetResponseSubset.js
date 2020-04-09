const pick = require('lodash/pick')
const handleMetaOut = use('App/Helpers/HandleMetaOut')

module.exports = function (modelInstance) {
    let base = pick(modelInstance.$attributes, modelInstance.constructor.addToResponse)
    for(let boolField of modelInstance.constructor.booleans) {
        base[boolField] = !!base[boolField]
    }
    for(let jsonField of modelInstance.constructor.JSONFields) {
        base[jsonField] = handleMetaOut(base[jsonField])
    }
    return base
}
