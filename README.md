![Adonis starter](project-image.png)

# Adonis starter

Jumpstart for a new backend project based on AdonisJS framework.

## Installation

Just fork this project and use it as you would use any other AdonisJS project

After cloning, edit your .env file (c/p .env.example) and run `npm run init` to speed things up.

## What's in a box?

- Cleaned up AdonisJS installation for API usage only
- Throttle request logic to prevent bot spam on public routes (returns status 429)
- Basic User model with separate Account model
- Account model has support for Google+, Facebook, LinkedIn and other popular networks
- Logic to connect social accounts together with standard
- User signup and login logic using JWT tokens
- Refresh JWT token logic
- Email service with templates and translations
- User forgot/reset password and account e-mail confirmation logic
- Custom responses with built-in response formatter
- Built-in language translation for response messages, emails, etc.
- Auto served public folder via static serve and middleware for basic auth for static files
- Auto documentation builder script using apidoc
- Basic unit test bootstrap
- Few test traits to make tests easier to write (catch email, validate response, sleep)

## package.json scripts

`npm run init` - runs migrations, DB seeds and builds docs for you. Run this after configuring .env

`npm run test` - runs unit tests

`npm run docs` - builds documentation using [apidoc specification](http://apidocjs.com/)

`npm run refresh` - helper script while developing... Refreshes migrations and runs DB seed

## PM2 configuration and starting process

Adonis handles environments with .env files... So there is no need to specify pm2 config files at all in most cases.

Just run: `pm2 start server.js --name "PORT APP_NAME"` and adonis will start project using .env file...

Example: `pm2 start server.js --name "1337 ADONIS STARTER API"`

## Adonis starter gotchas

There are few tweaks to Adonis natural behaviour in this starter project :)

### Routing

**start/routes.js** is modified to use routes from **app/Routes** where each route group can be separated to different files.

Benefits of using this logic is that you can separate routes in easier to navigate way, and also... you can prefix and add group middleware to routes simpler.

Please check the logic inside *start/routes.js* and *app/Routes* to better understand how it can be used.

### Dates format in responses

This starter includes CastDate Models trait. This should be used inside every model like this:

```javascript
static boot() {
  super.boot()
  this.addTrait('CastDate') // <-- just after super.boot, add CastDate trait
}
```

CastDate trait by default formats all dates inside model using unix timestamp (milliseconds). But if you need any other format you can pass second argument to .addTrait like this:

`this.addTrait('CastDate', {format: 'DD.MM.YYYY. HH:mm'})`

It accepts all rules from [moment.js format method](http://momentjs.com/docs/#/displaying/format/). Defaulting to: "x".

### API response formatting

Inside **start/kernel.js**  globalMiddleware you will notice **HandleResponse** middleware. This middleware should stay on top of the global middleware list because it awaits everything and it is called before response is sent to user.

Job of this middleware is to format and translate whatever you return from controller.

Usage of this logic is pretty simple... Just call response.METHOD ([allowed response methods list](https://github.com/poppinss/node-res/blob/develop/methods.js)) when ending controller method and status code will immediately be set and whatever you pass to response will be formatted in this format:

```json
{
  "data": [
    {
      "whatever": "Data is always present, and it's always an array. Even when returning single item."
    }
  ],
  "message": "I'm always here and I'm always string"
}
```

So for example:

`response.badRequest('Some custom string')` - will send payload with status code 400, containing data key with value of empty array and message will be set to: 'Some custom string'

`response.ok(userObjectsFromDb)` - will send payload with status code 200, containing data key with value of user objects, and message will be set to: ''

### Translation logic

Translating responses is very easy. globalMiddleware **HandleResponse** is also checking if string from database table locales is sent and it automatically translates it to user locale.

Usage of this is simple. For example:

`response.ok('auth.validationEmailSent')` - will translate *auth.validationEmailSent* string, if found in database table locales, and put its translated string value inside response payload inside message key.

If translation is not found for required locale in database table locales... string will be inserted as untranslated string to locales table (check database columns for table locales).

**IMPORTANT** - translator logic can be used across entire project, not only responses. Just use import `const translateService = use('App/Services/Translate')` and use it wherever you want. 

Best example is inside **app/Services/Mail.js** and inside email templates (**resource/views/email/\*.edge**). 

## Tips and tricks

- If you want to translate all responses to user language, use `Accept-Language` header or `?lang` query parameter in every request (ex. send values like: en, de, fr, xx)
- For testing emails, there is a great site: [MailTrap](https://mailtrap.io/). Make account there and configure email inside .env
- If needed you can edit **CastDate** trait inside **app/Models/Traits/CastDate.js** to change default formatting of dates on entire project.
- If you really want to send message response with validation errors when user fails to send some keys, you can freely use response.badRequest(validation.messages()). Response formatter will handle all the rest.
- ... will add more :) #todo
