const Event = use('Event')

Event.on('user::register', 'User.register') // you can pass array as second parameter if you want multiple methods...
Event.on('user::resendValidation', 'User.resendValidation')
Event.on('user::forgotPassword', 'User.forgotPassword')
