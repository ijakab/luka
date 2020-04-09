'use strict'

const {test, trait, before} = use('Test/Suite')('01-01 Auth - register main')
const Env = use('Env')
const User = use('App/Models/User')
const _ = use('lodash')
const jwt = use('jsonwebtoken')

before(async () => {
    this.testData = global.testData
    this.testUser = this.testData.testUser
})

trait('Test/ApiClient')
trait('CustomTest/AssertStatus')
trait('CustomTest/Validate')
trait('CustomTest/Sleep')
trait('CustomTest/GetEmail')

let emailToken

test('Register user and check email', async ({client, getEmail, assert, assertStatus}) => {

    const response = await client.post('/api/auth/register').send(this.testUser).end()
    assertStatus(response, 200)

    // catch sent email using getEmail trait
    const recentEmail = await getEmail()

    assert.equal(_.first(recentEmail.message.to).address, this.testUser.email)
    // check if jwt token is inside email html, and fetch it for later use
    try {
        emailToken = recentEmail.message.html.split(/href=.*?token\=(.+)?"/gmi)[1]
    } catch (err) {
        throw new Error('Email token was not found using regex pattern inside email sent to user on registration!')
    }

})

test('Should NOT register same user', async ({client, assertStatus}) => {

    const response = await client.post('/api/auth/register').send(this.testUser).end()

    assertStatus(response, 400)
})

test('Should NOT register user with invalid or same email (also using .+ for gmail)', async ({client, assertStatus}) => {

    const emailTester = {
        firstname: 'Email',
        lastname: 'Tester',
        username: 'validUsername',
        password: 'testPass123',
        password_confirmation: 'testPass123',
        terms_accepted: true
    }

    const invalidEmails = ['nomonkey.gmail.com', 'ilooksovalid@gmail..com', 'ihaveacomma@gmail,com']
    // valid email is test@gmail.com
    const validExistingEmails = ['t.e.s.t.e.r@gmail.com', 'tester+04@gmail.com'] // check . and + syntax as same email if gmail account

    await Promise.all(invalidEmails.map(async (email) => {

        const userPayload = Object.assign({email}, emailTester)

        const response = await client.post('/api/auth/register').send(userPayload).end()
        assertStatus(response, 400)
    }))


    // test if valid emails return emailExists error if slightly edited
    await Promise.all(validExistingEmails.map(async (email) => {

        const userPayload = Object.assign({email}, emailTester)

        const response = await client.post('/api/auth/register').send(userPayload).end()
        assertStatus(response, 400)
        response.assertJSONSubset({
            code: 'auth.emailExists'
        })
    }))
})

test('Should NOT register user with special chars inside username', async ({client, assertStatus}) => {

    const usernameTester = {
        firstname: 'Username',
        lastname: 'Tester',
        email: 'username_tester@gmail.com',
        password: 'testPass123',
        password_confirmation: 'testPass123',
        terms_accepted: true
    }

    const usernames = ['$$$richy$$$', 'I have space chars', 'NOO', 'My-username-is-waaaaaaay-to-loooong']

    await Promise.all(usernames.map(async (username) => {

        const userPayload = Object.assign({username}, usernameTester)

        const response = await client.post('/api/auth/register').send(userPayload).end()

        assertStatus(response, 400)
    }))


})

test('Should not login user while account is not verified', async ({client, assertStatus}) => {

    const response = await client.post('/api/auth/login').send({
        username: this.testUser.username,
        password: this.testUser.password
    }).end()

    assertStatus(response, 403)

})

test('Should not validate email of user when wrong token is sent', async ({client, sleep, assertStatus}) => {

    const noTokenInPayload = await client.post('/api/auth/validateEmail').send().end()

    const totallyWrongResponse = await client.post('/api/auth/validateEmail').send({token: 'WRONG TOKEN!'}).end()

    // get real user from db
    const user = await User.first()
    const expiredToken = await jwt.sign({
        mailValidation: user.id
    }, Env.get('APP_KEY'), {
        expiresIn: '1 second'
    })

    // wait that one second, and a little bit so token expires :)
    await sleep(1337)

    const validJwtButExpired = await client.post('/api/auth/validateEmail').send({
        token: expiredToken
    }).end()


    const validJwtButNotValidToken = await client.post('/api/auth/validateEmail').send({
        token: await jwt.sign({
            mailValidation: user.id
        }, 'Wrong app key! Token was forged by some nasty guy', {
            expiresIn: '1 day'
        })
    }).end()


    // also validate response messages so we are sure token errors were thrown
    validJwtButExpired.assertStatus(401)
    validJwtButExpired.assertJSONSubset({
        code: 'error.tokenExpired'
    })


    const otherResponses = [totallyWrongResponse, validJwtButNotValidToken, noTokenInPayload]
    otherResponses.forEach((res) => {
        res.assertStatus(400)
        res.assertJSONSubset({
            code: 'error.invalidToken'
        })
    })

})

test('It should resend validation for email of user', async ({client, getEmail, assert, assertStatus}) => {

    const response = await client.post('/api/auth/resendValidation').send({username: this.testUser.email}).end()
    assertStatus(response, 200)

    // catch sent email using getEmail trait
    const recentEmail = await getEmail()

    assert.equal(_.first(recentEmail.message.to).address, this.testUser.email)
    // check if jwt token is inside email html, and fetch it for later use
    try {
        emailToken = recentEmail.message.html.split(/href=.*?token\=(.+)?"/gmi)[1]
    } catch (err) {
        throw new Error('Email token was not found using regex pattern inside email sent to user on registration!')
    }

    assert.exists(emailToken)

})

test('It should resend validation for username of user', async ({client, getEmail, assert, assertStatus}) => {

    const response = await client.post('/api/auth/resendValidation').send({username: this.testUser.username}).end()
    assertStatus(response, 200)

    // catch sent email using getEmail trait
    const recentEmail = await getEmail()

    assert.equal(_.first(recentEmail.message.to).address, this.testUser.email)
    // check if jwt token is inside email html, and fetch it for later use
    try {
        emailToken = recentEmail.message.html.split(/href=.*?token\=(.+)?"/gmi)[1]
    } catch (err) {
        throw new Error('Email token was not found using regex pattern inside email sent to user on registration!')
    }

    assert.exists(emailToken)

})

test('Should not allow password reset while account is not activated', async ({client, assertStatus}) => {

    const response = await client.post('/api/auth/forgotPassword').send({
        username: this.testUser.username
    }).end()
    assertStatus(response, 403)

    response.assertJSONSubset({
        code: 'auth.mailNotValidated'
    })

})

test('Should validate email if token is sent correctly and send welcome email', async ({client, assert, getEmail, assertStatus}) => {

    const user = await User.first()

    // check if he is already validated
    assert.isNotTrue(user.validated)

    const response = await client.post('/api/auth/validateEmail').send({token: emailToken}).end()
    assertStatus(response, 200)

    const recentEmail = await getEmail()

    assert.equal(_.first(recentEmail.message.to).address, this.testUser.email)
})

test('It should respond that email is already validated', async ({client, assertStatus}) => {

    const response = await client.post('/api/auth/resendValidation').send({username: this.testUser.email}).end()
    assertStatus(response, 400)
    response.assertJSONSubset({
        code: 'auth.emailAlreadyValidated'
    })
})

test('Resend validation should fail with 404 if wrong email', async ({client, assertStatus}) => {
    // this is to prevent people of using this route to fetch emails in our db
    const response = await client.post('/api/auth/resendValidation').send({username: 'somestrangeguy@gmail.com'}).end()
    assertStatus(response, 404)
    response.assertJSONSubset({
        code: 'auth.emailOrUsernameNotFound'
    })
})

test('Resend validation should fail with 404 if wrong username', async ({client, assertStatus}) => {
    // this is to prevent people of using this route to fetch emails in our db
    const response = await client.post('/api/auth/resendValidation').send({username: 'whoami'}).end()
    assertStatus(response, 404)
    response.assertJSONSubset({
        code: 'auth.emailOrUsernameNotFound'
    })
})

test('Resend validation should fail with 400 if validated email', async ({client, assertStatus}) => {
    // this is to prevent people of using this route to fetch emails in our db
    const response = await client.post('/api/auth/resendValidation').send({username: this.testUser.email}).end()
    assertStatus(response, 400)
    response.assertJSONSubset({
        code: 'auth.emailAlreadyValidated'
    })
})

test('Resend validation should fail with 400 if validated username', async ({client, assertStatus}) => {
    // this is to prevent people of using this route to fetch emails in our db
    const response = await client.post('/api/auth/resendValidation').send({username: this.testUser.username}).end()
    assertStatus(response, 400)
    response.assertJSONSubset({
        code: 'auth.emailAlreadyValidated'
    })
})
