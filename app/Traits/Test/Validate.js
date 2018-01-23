const {validate} = use('Validator')

module.exports = function (suite) {
  suite.Context.getter('validate', () => {

    return async function (forValidation, rules) {

      const validation = await validate(forValidation, rules)

      if (validation.fails()) throw new Error('Validation failed!')

    }
  })
}
