const Mail = use('Mail')

module.exports = function (suite) {
  suite.Context.getter('getEmail', () => {

    // fake all emails, as soon as this getter is called
    Mail.fake()

    // then return function which waits for new mails
    return async function () {
      return await new Promise((resolve) => {

        // try to pull sent email every 100 ms
        const interval = setInterval(() => {

          let recentEmail = Mail.pullRecent()

          if (recentEmail) {
            // clear interval
            clearInterval(interval)
            // return email
            resolve(recentEmail)
          }
        }, 100)
      })

    }
  })
}
