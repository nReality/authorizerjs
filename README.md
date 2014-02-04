authorizer
============

Lightweight connect based authorization middleware.

This library was extracted from an internal project where our authorization requirements where extremely simple. Large and more feature-rich libraries seemed like overkill. We also wanted something that is expressive and consistent with express.js' routes.

###Installation

```sh
npm install authorizer --save
```

###Example

This example makes use of passport.js for authentication

```js
var express    = require('express')
var passport   = require('passport');
var authorizer = require('authorizer');

var routes = [
	{method : 'delete',   path : '/api*',         check : function(req) {return req.user.isAdmin();}},
	{method : 'post',     path : '/api/resource', check : function(req) {return req.user.isAdmin();}},
	{method : 'post',     path : '/api/auth*',    check : authorizer.assertAlwaysOpen},
	{method : 'get,post', path : '/api*',         check : authorizer.assertIsAuth},
	{method : '*',        path : '*',             check : function(req) {return req.isAuthenticated();}}
];
	
app.configure(function() {
	app.passport = passport;

	app.use(express.bodyParser());
	app.use(express.methodOverride());

	app.use(express.cookieParser()); 
	app.use(express.session({ secret: 'Some secet' })); 
	app.use(passport.initialize());
	app.use(passport.session());

	app.use(authorizer(routes));
	app.use(app.router);
});
```
