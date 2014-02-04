var methods  = require('methods');
var parse = require('connect').utils.parseUrl;
var Route = require('./authorizer-route');

exports = module.exports = function authorizer(map) {

	var routes = {};

	methods.forEach(function(method) {
		routes[method] = new Array();
	});

	map.forEach(function(item) {
		if(item.method === '*'){ 
			methods.forEach(function(method){
				routes[method].push(new Route(method, item.path, item.check));
			});
		}
		else {
			item.method.split(',').forEach(function(method) {
				routes[method].push(new Route(method, item.path, item.check));
			});
		}
	});

	return function(req, res, next) {
		try {
			var method = resolveMethod(req);
			var methodRoute = routes[method];
			var url = parse(req);

			for(i = 0; i < methodRoute.length; i++) {
				var route = methodRoute[i];
				if(route.match(url.pathname))
					if(!route.assertion(req)) {
						unauthorized(res);
						return next(new Error('Unauthorized'));
					} else {
						return next();
					}
			};
			unauthorized(res);
			return next(new Error('Unauthorized'));
		} catch (e) {
			console.log(e);
			return next(e);
		}
	}
}

exports.assertAlwaysOpen = function(req) {return true;} 
exports.assertAlwaysClosed = function(req) {return false;} 
exports.assertIsAuth = function(req) {return req.isAuthenticated();} 
exports.assertIsAdmin = function(req) {return req.user && req.user.admin;} 

function resolveMethod(req) {
	var resolvedMethod = req.method.toLowerCase();
	return (resolvedMethod == 'head') ? 'get' : resolvedMethod;
}
function unauthorized(res) {
	res.statusCode = 401;
}

function makeAssert (assert) {
	return function(req, res, next) {
		try {
			console.log('asserting: ' + assert(req));
			if(!assert(req)) return reject(req, res);
		} catch (e) {
			console.log(e);
			res.send(500);
		}
	} 
}
function reject (req, res) {
	console.log('Rejected: user=%s, authenticated=%d, admin=%d, method=%s, path=%s', 
			(req.user) ? req.user._id : 'none', 
			req.isAuthenticated(), 
			(req.user) ? req.user.admin: 'none', 
			req.method, 
			req.url)
	res.send(401);
}
