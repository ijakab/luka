'use strict'

class Paginable {
    register(Model, customOptions = {}) {

        const defaultOptions = {
            page: 1, // default pagination page
            limit: 10, // default pagination limit per page
            maxLimit: 50 // maximum limit per page
        }

        const options = Object.assign(defaultOptions, customOptions)

        Model.queryMacro('paginable', function (query = {}) {
            const pagination = {
                page: parseInt(query.page >= 1 ? query.page : options.page),
                limit: parseInt((query.limit >= 1 && query.limit <= options.maxLimit) ? query.limit : options.limit)
            }

            return this.paginate(pagination.page, pagination.limit)
        })

    }
}

module.exports = Paginable
