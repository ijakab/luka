const {validate, sanitize} = use('Validator')
const pick = require('lodash/pick')
const clone = require('lodash/clone')
const throwError = use('App/Helpers/ThrowError')

class BaseService {

    constructor(ctx, Model) {
        this.Model = Model
        this.ctx = ctx
        this.apiKey = ctx.apiKey
        this.user = ctx.user
    }

    getAll(filters = {}) {
        let q = this.Model
            .query()
            .whereApp(this.apiKey)
        if(q.standardFilters){
            q.standardFilters(filters)
        }
        return q
    }

    getSingle(id) {
        return this.getAll()
            .where('id', id)
    }

    async create(userParams, forceParams = {}) {
        const allowedParams = BaseService.allowedInput(userParams, this.Model.allowed)
        Object.assign(allowedParams, forceParams)
        await BaseService.validateInput(allowedParams, this.Model.rules, ...this.Model.required)

        return await this.Model.create({
            ...allowedParams,
            apiKey: this.ctx.apiKey
        })
    }

    async update(instanceOrId, allParams, forceParams={}) {
        const instance = await this.getInstance(instanceOrId)

        const allowedParams = BaseService.allowedInput(allParams, this.Model.allowed)
        Object.assign(allowedParams, forceParams)
        instance.merge(allowedParams)
        await BaseService.validateInput(instance.$attributes, this.Model.rules, ...this.Model.required)

        await instance.save()
        return instance
    }

    async delete(instanceOrId) {
        const instance = await this.getInstance(instanceOrId)
        await instance.delete()
        return instance
    }

    static sanitizeInput(allParams, sanitization) {
        if (!sanitization) return allParams
        return sanitize(allParams, sanitization)
    }

    static allowedInput(allParams, allowed) {
        if (!allowed) return allParams
        return pick(allParams, allowed)
    }

    static parseInput(allParams, Model = {}) {
        return this.sanitizeInput(this.allowedInput(allParams, Model.allowed), Model.sanitize)
    }

    static async validateInput(allParams, rules, ...requiredFields) {
        if (!rules) return
        rules = clone(rules)
        for(let key of Object.keys(rules)) {
            if(requiredFields.includes(key)) rules[key] = 'required|' + rules[key]
        }
        const validation = await validate(allParams, rules)
        if (validation.fails()) this.throwError(400, null, validation.messages())
    }

    static throwError(...params) {
        throwError(...params)
    }
}

module.exports = BaseService
