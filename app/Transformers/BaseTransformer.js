// todo check this every time you update bumblebee!
// we added Logger.warning if N+1 eager load...
// also we added getAdditional to fetch stuff from context easier...

const TransformerAbstract = use('Adonis/Addons/Bumblebee/TransformerAbstract')
const Logger = use('Logger')
const {without} = use('lodash')

class BaseTransformer extends TransformerAbstract {

    getAdditional(context) {
        if (!context || !context._transform_) return {}
        return context._transform_.additional || {}
    }

    _jsonFromModel(model) {
        if (!model) return {}

        return (model.toJSON && model.toJSON()) || model
    }

    async _eagerloadIncludedResource(resourcesToInclude, data) {
        if (!data.loadMany) return
        let additionalLoad = []

        let resourcesToLoad = resourcesToInclude.filter(resource => {
            // check that a relation method exists and that the relation was not previously loaded.
            const filterRule = (data[resource] instanceof Function) && !data.getRelated(resource) && data.$relations[resource] !== null
            if (filterRule) additionalLoad.push(resource)
            return filterRule
        })

        if (!resourcesToLoad.length) return

        if (resourcesToLoad.length) {
            Logger.warning('Unnecessary N+1 query load detected on model: %s! %j', data.constructor.name, additionalLoad, resourcesToLoad)
            await data.loadMany(resourcesToLoad)
        }

    }
}

module.exports = BaseTransformer