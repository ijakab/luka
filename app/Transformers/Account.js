const TransformerAbstract = use('App/Transformers/BaseTransformer')

class AccountTransformer extends TransformerAbstract {
    availableInclude() {
        return [
            'user'
        ]
    }

    defaultInclude() {
        return []
    }

    transform(model, ctx) {

        const json = this._jsonFromModel(model) // call getters if needed

        // ****************************************** NOTE ******************************************
        // adapt however you want...
        // ****************************************** **** ******************************************

        return {
            id: json.id,
            type: json.type,
            email: json.email,
            validated: json.validated,
            social_id: json.social_id
        }
    }

    includeUser(model) {
        return this.item(model.getRelated('user'), 'User')
    }

}

module.exports = AccountTransformer