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
			unauthorized(res);
			res.send(e);
			return next(e);
		}
	}
}

exports.assertAlwaysOpen = function(req) {return true;} 
exports.assertAlwaysClosed = function(req) {return false;} 

function resolveMethod(req) {
	var resolvedMethod = req.method.toLowerCase();
	return (resolvedMethod == 'head') ? 'get' : resolvedMethod;
}
function unauthorized(res) {
	res.statusCode = 403;
}
