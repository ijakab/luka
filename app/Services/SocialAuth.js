const got = use('got')
const _ = use('lodash')


module.exports = {

  facebook: async function (accessToken) {

    const apiUrl = 'https://graph.facebook.com/v2.7'
    const profileUrl = `${apiUrl}/me?access_token=${accessToken}&fields=email,name`

    const fetchProfile = await got(profileUrl, {
      headers: {
        'Accept': 'application/json'
      },
      json: true
    })

    if (!_.has(fetchProfile.body, 'id', 'name', 'email')) throw new Error('Not enough data inside facebook response')

    return {
      id: fetchProfile.body.id,
      name: fetchProfile.body.name,
      email: fetchProfile.body.email,
      avatar: `${apiUrl}/${fetchProfile.body.id}/picture?type=normal`
    }

  },


  google: async function (accessToken) {

    const apiUrl = 'https://www.googleapis.com/plus/v1'
    const profileUrl = `${apiUrl}/people/me`

    const fetchProfile = await got(profileUrl, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      json: true
    })

    if (!_.has(fetchProfile.body, 'id', 'displayName', 'emails', 'image')) throw new Error('Not enough data inside facebook response')

    return {
      id: fetchProfile.body.id,
      name: fetchProfile.body.displayName,
      email: _.get(fetchProfile.body, 'emails.0.value'),
      avatar: _.get(fetchProfile.body, 'image.url')
    }

  },

  // todo test this out
  linkedIn: async function (accessToken) {

    const apiUrl = 'https://api.linkedin.com/v1'
    const profileUrl = `${apiUrl}/people/~:(id,formatted-name,email-address,picture-url)`

    const fetchProfile = await got(profileUrl, {
      headers: {
        'x-li-format': 'json',
        'Authorization': `Bearer ${accessToken}`
      },
      json: true
    })

    if (!_.has(fetchProfile.body, 'id', 'formattedName', 'emailAddress', 'pictureUrl')) throw new Error('Not enough data inside facebook response')

    return {
      id: fetchProfile.body.id,
      name: fetchProfile.body.formattedName,
      email: fetchProfile.body.emailAddress,
      avatar: fetchProfile.body.pictureUrl
    }

  }


  // // INSTAGRAM IS NOT RETURNING EMAIL
  // instagram: async function (accessToken) {
  //
  //   const apiUrl = 'https://api.instagram.com/v1'
  //   const profileUrl = `${apiUrl}/users/self?access_token=${accessToken}`
  //
  //   const fetchProfile = await got(profileUrl, {
  //     headers: {
  //       'Accept': 'application/json'
  //     },
  //     json: true
  //   })
  //
  //   if (!_.has(fetchProfile.body, ['id', 'full_name', 'profile_picture'])) throw new Error('Not enough data inside facebook response')
  //
  //   return {
  //     id: fetchProfile.body.id,
  //     name: fetchProfile.body.full_name,
  //     email: false,
  //     avatar: fetchProfile.body.profile_picture
  //   }
  //
  // }


}
