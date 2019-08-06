// a little bit smarter .assertStatus which throws response.body to console...

module.exports = function (suite) {
    suite.Context.getter('assertStatus', () => {
        return function (response, status) {
            try {
                response.assertStatus(status)
            } catch (err) {
                console.log('------- BODY -------')
                console.log(response.body)
                console.log('------- **** -------')
                throw err
            }

        }
    })
}
