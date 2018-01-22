'use strict'

const {test, trait} = use('Test/Suite')('Auth')

trait('Test/ApiClient')

test('login user', async ({client}) => {

  const response = await client.post('/api/auth/login').end()

  // response.assertStatus(200)
  // response.assertJSONSubset([{
  //   title: 'Adonis 101',
  //   body: 'Blog post content'
  // }])
})
