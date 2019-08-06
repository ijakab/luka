'use strict'

class IdOrSlug {
    register(Model, customOptions = {}) {
        const defaultOptions = {slug: 'slug'}

        const options = Object.assign(defaultOptions, customOptions)

        Model.queryMacro('idOrSlug', function (idOrSlug) {

            // if id query by id
            if (Number(idOrSlug)) {
                this.where('id', idOrSlug)
            } else { // query by slug
                this.where(options.slug, idOrSlug)
            }

            return this

        })

    }
}

module.exports = IdOrSlug
