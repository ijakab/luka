const {validate} = use('Validator')

module.exports = function (suite) {
  suite.Context.getter('validate', () => {

    return async function (forValidation, rules) {

      // create array from it so we allow multiple to be validated as one
      forValidation = Array.isArray(forValidation) ? forValidation : [forValidation]

      for (let validationObj of forValidation) {

        const validation = await validate(validationObj, rules)

        if (validation.fails()) throw new Error('Validation failed!')

      }

    }
  })
}
