'use strict'
const BaseService = use('App/Services/BaseService')

class StandardFiltering {
    register (Model, customOptions = {}) {
        this.Model = Model
        const defaultOptions = {
            orderFields: Model.canSortBy,
            hasSlugs: Model.hasSlugs,
            paramFilters: Model.canFilterBy,
            searchBy: Model.canSearchBy
        }
        this._options = Object.assign(defaultOptions, customOptions)
        let self = this
        Model.queryMacro('standardFilters', function (filters={}, customFilterHandlers) {
            self.handleOrdering(this, filters)
            self.handleFilters(this, filters, customFilterHandlers)
            self.handleSearchString(this, filters)
            return this
        })
    }

    handleOrdering(q, {sort}) {
        if(sort && sort.param) {
            if(!this._options.orderFields.includes(sort.param)) BaseService.throwError(400, `Unrecognized sort param '${sort.param}'`)
            let mode = sort.order || 'asc'
            if(!['asc', 'desc', 'ASC', 'DESC'].includes(mode)) BaseService.throwError(400, `Unrecognized sort mode '${mode}'`)
            q.orderBy(sort.param, mode)
        } else {
            if(this._options.orderFields.includes('created_at')) q.orderBy('created_at', 'desc')
            else if (this._options.orderFields.includes('createdAt')) q.orderBy('createdAt', 'desc')
        }
    }

    handleFilters(q, {filters = []}, customFilterHandlers={}) {
        for(let filter of filters) {
            if(customFilterHandlers[filter.key]) {
                customFilterHandlers[filter.key](q, filter)
                continue
            }
            if(this.Model.customFilterHandlers && this.Model.customFilterHandlers[filter.key]) {
                this.Model.customFilterHandlers[filter.key](q, filter)
                continue
            }
            if(defaultFilterHandlers[filter.key]) {
                defaultFilterHandlers[filter.key](q, filter)
                continue
            }
            this._handleDefaultFilter(q, filter)
        }
    }

    handleSearchString(q, {keywords}) {
        if(this._options.searchBy && this._options.searchBy.length && keywords) {
            q.where(sub => {
                for(let searchField of this._options.searchBy) {
                    sub.orWhere(searchField, 'like', `%${keywords}%`)
                }
            })
        }
    }

    _handleDefaultFilter(q, {key, value}) {
        if(!key || value === undefined) BaseService.throwError(400, 'Invalid filter sent, no key or value key on it')
        if(!this.Model.keyedAttributeConfig[key] || !this.Model.keyedAttributeConfig[key].canFilterBy) BaseService.throwError(400, `Unrecognized filter ${key} on model ${this.Model.name}`)
        if(typeof value !== 'object' || Array.isArray(value) || value === null) {
            value = {
                '=': value
            }
        }
        for(let operator of Object.keys(value)) {
            let innerValue = value[operator]
            switch (operator) {
                case '=':
                    if(Array.isArray(innerValue)) q.whereIn(key, innerValue)
                    else q.where(key, innerValue)
                    break
                case '!=':
                    if(Array.isArray(innerValue)) q.whereNotIn(key, innerValue)
                    else q.whereNot(key, innerValue)
                    break
                case '>':
                case '>=':
                case '<':
                case '<=':
                    q.where(key, operator, innerValue)
                    break
            }
        }
    }
}

const defaultFilterHandlers = {

}

module.exports = StandardFiltering
