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
        return this.item(model.getRelated('user'), UserTransformer)
    }

}

module.exports = AccountTransformer

// ****************************************** NOTE ******************************************
// THIS IS VERY IMPORTANT!!! PUT ALL TRANSFORMERS HERE WHEN YOU USE use(transformer......)
// ****************************************** **** ******************************************

// put all cyclic transformers to bottom // https://stackoverflow.com/questions/10869276/how-to-deal-with-cyclic-dependencies-in-node-js#answer-14098262
const UserTransformer = use('App/Transformers/User')