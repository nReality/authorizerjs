authorizer
============

Lightweight connect based authorization middleware.

This library was extracted from an internal project where our authorization requirements where extremely simple. Large and more feature-rich libraries seemed like overkill. We also wanted something that is expressive and consistent with express.js' routes.

Example
============

```js
  var map = [
		{method : 'delete', path : '/api*', 		check : authorizer.assertIsAdmin},
		{method : 'post', 	path : '/api/user', 	check : authorizer.assertIsAdmin},
		{method : 'post', 	path : '/api/species', 	check : authorizer.assertIsAdmin},
		{method : 'post', 	path : '/api/auth*', 	check : authorizer.assertAlwaysOpen},
		{method : 'get,post', 	path : '/api*', 	check : authorizer.assertIsAuth},
		{method : '*', 		path : '*', 			check : authorizer.assertAlwaysClosed}
	];
	
	app.configure(function() {
	
    // setup basic middleware
    // setup authentication middleware
		app.use(authorizer(map));
		app.use(app.router);

	});
```
