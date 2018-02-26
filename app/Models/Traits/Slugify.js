'use strict'

const slug = use('slug')

class Slugify {
    register(Model, customOptions = {}) {
        const defaultOptions = {
            column: false, // which db column should be slugged
            prefix: '', // should it have prefix
            sufix: '', // or sufix?

            dbKey: 'slug', // where to store slug info

            // pass any options from slug docs https://www.npmjs.com/package/slug
            slugOptions: {
                replacement: '-',               // replace spaces with replacement
                symbols: true,                  // replace unicode symbols or not
                remove: null,                   // (optional) regex to remove characters
                lower: true,                    // result in lower case
                charmap: slug.charmap,          // replace special characters
                multicharmap: slug.multicharmap // replace multi-characters
            }
        }

        const opts = Object.assign(defaultOptions, customOptions)

        // first check if we need to do anything at all...
        if (!opts.column) {
            return console.warn('Slugify trait used without specifying database column inside options!')
        }

        Model.addHook('beforeSave', async (model) => {

            let slugString = slug(`${opts.prefix}${model[opts.column]}${opts.sufix}`, opts.slugOptions)

            // check if this slug already exists in db, and if it does, add '-count' sufix to it
            let count = await Model.query().where(opts.dbKey, slugString).getCount()

            if (count) {
                // cover edge case...
                while (await Model.query().where(opts.dbKey, `${slugString}${count ? `-${count}` : ''}`).getCount()) {
                    count++
                }
            }

            // fill value of dbKey with slug
            return model[opts.dbKey] = `${slugString}${count ? `-${count}` : ''}`
        })

    }
}

module.exports = Slugify
