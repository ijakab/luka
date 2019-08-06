'use strict'

/*
 |--------------------------------------------------------------------------
 | Vow file
 |--------------------------------------------------------------------------
 |
 | The vow file is loaded before running your tests. This is the best place
 | to hook operations `before` and `after` running the tests.
 |
 */

// Uncomment when want to run migrations
// const ace = require('@adonisjs/ace')

module.exports = (cli, runner) => {
    runner.before(async () => {


        // todo delete this after virk fixes issue with test ordering
        // https://forum.adonisjs.com/t/sequential-testing/3476/7
        runner._suites.sort(function (a, b) {
            if (a.group._title < b.group._title) {
                return -1
            }
            if (a.group._title > b.group._title) {
                return 1
            }
            return 0
        })


        /*
         |--------------------------------------------------------------------------
         | Start the server
         |--------------------------------------------------------------------------
         |
         | Starts the http server before running the tests. You can comment this
         | line, if http server is not required
         |
         */
        use('Adonis/Src/Server').listen(process.env.HOST, process.env.PORT)

        /*
         |--------------------------------------------------------------------------
         | Run migrations
         |--------------------------------------------------------------------------
         |
         | Migrate the database before starting the tests.
         |
         */
        // await ace.call('migration:run') // we are running migration:refresh inside npm run test


        // set some test data to global so we can use same stuff between test files
        global.testData = require('./test/testData')
    })

    runner.after(async () => {
        /*
         |--------------------------------------------------------------------------
         | Shutdown server
         |--------------------------------------------------------------------------
         |
         | Shutdown the HTTP server when all tests have been executed.
         |
         */
        use('Adonis/Src/Server').getInstance().close()

        /*
         |--------------------------------------------------------------------------
         | Rollback migrations
         |--------------------------------------------------------------------------
         |
         | Once all tests have been completed, we should reset the database to it's
         | original state
         |
         */
        // await ace.call('migration:reset') // we are running migration:refresh so we don't need to reset db after tests here
    })
}
