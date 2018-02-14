module.exports = function (suite) {
    suite.Context.getter('sleep', () => {

        // simple sleep function...
        return async function (ms) {
            return await new Promise((resolve) => {

                setTimeout(() => {
                    resolve()

                }, ms)
            })

        }
    })
}
