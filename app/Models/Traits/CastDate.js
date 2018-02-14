'use strict'

// formats all dates when sent to client using http://momentjs.com/docs/#/displaying/format/
// defaults to milliseconds unix timestamp (aka 'x' moment format)

class CastDate {
    register(Model, customOptions = {}) {
        const defaultOptions = {
            format: 'x' // milliseconds (unix timestamp)
        }

        const options = Object.assign(defaultOptions, customOptions)


        Model.castDates = function (field, value) {
            return value.format(options.format)
        }

    }
}

module.exports = CastDate
