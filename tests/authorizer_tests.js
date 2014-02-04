var authorizer = require('../');
var should = require('should');
var chai = require('chai');

chai.use(require('chai-connect-middleware'));

describe('matches GET and POST but not DELETE', function() {
	var map = [{method : 'get,post', path : '*', check : authorizer.assertAlwaysOpen}];
	var runner = new MiddlewareRunner(map);

	it('should deny DELETE requests', function(done) {
		runner.runWithCheck(runner.makeReq("DELETE"), 403, done);
	});

	it('should allow POST requests', function(done) {
		runner.runWithCheck(runner.makeReq("POST"), 200, done);
	});
	it('should allow GET requests', function(done) {
		runner.runWithCheck(runner.makeReq("GET"), 200, done);
	});
});

describe('matches HEAD requests to GET', function() {
	var map = [{method : 'get', path : '*', check : authorizer.assertAlwaysOpen}];
	var runner = new MiddlewareRunner(map);

	it('should allow HEAD requests', function(done) {
		runner.runWithCheck(runner.makeReq("HEAD"), 200, done);
	});

	it('should allow GET requests', function(done) {
		runner.runWithCheck(runner.makeReq("GET"), 200, done);
	});
});

describe('no match found in router', function() {

	var map = [{method : 'get', path : '/one-path', check : authorizer.assertAlwaysOpen}];
	var runner = new MiddlewareRunner(map);

	it('should allow GET request for one-path', function(done) {
		runner.runWithCheck(runner.makeReq("GET", "http://host/one-path"), 200, done);
	});

	it('should deny GET request for the-other-path', function(done) {
		runner.runWithCheck(runner.makeReq("GET", "http://host/the-other-path"), 403, done);
	});
});

describe('no match found in router', function() {

	var map = [{method : 'delete', path : '*', check : authorizer.assertAlwaysOpen}];
	var runner = new MiddlewareRunner(map);

	it('should deny access to GET requests', function(done) {
		runner.runWithCheck(runner.makeReq("GET"), 403, done);
	});

	it('should deny access to POST requests', function(done) {
		runner.runWithCheck(runner.makeReq("POST"), 403, done);
	});
});

describe('empty map passed in', function() {

	var map = [];
	var runner = new MiddlewareRunner(map);

	it('should deny access to GET requests', function(done) {
		runner.runWithCheck(runner.makeReq("GET"), 403, done);
	});

	it('should deny access to POST requests', function(done) {
		runner.runWithCheck(runner.makeReq("POST"), 403, done);
	});
});

describe('map allows access to all methods and paths', function() {

	var map = [{method : '*', path : '*', check : authorizer.assertAlwaysOpen}];
	var runner = new MiddlewareRunner(map);

	it('should allow access to GET requests', function(done) {
		runner.runWithCheck(runner.makeReq("GET"), 200, done);
	});

	it('should allow access to POST requests', function(done) {
		runner.runWithCheck(runner.makeReq("POST"), 200, done);
	});
});

describe('map restricts access to all methods and paths', function() {
	var map = [{method : '*', path : '*', check : authorizer.assertAlwaysClosed}];
	var runner = new MiddlewareRunner(map);

	it('should deny GET requests', function(done) {
		runner.runWithCheck(runner.makeReq("GET"), 403, done);
	});

	it('should deny POST requests', function(done) {
		runner.runWithCheck(runner.makeReq("POST"), 403, done);
	});
});

describe('matches using custom assertion', function() {
	var shouldAllow;
	var map = [{method : 'get', path : '*', check : function(req) { return shouldAllow;}}];
	var runner = new MiddlewareRunner(map);

	it('should allow when assertion returns true', function(done) {
		shouldAllow = true;
		runner.runWithCheck(runner.makeReq("HEAD"), 200, done);
	});

	it('should deny when assertion returns false', function(done) {
		shouldAllow = false;
		runner.runWithCheck(runner.makeReq("GET"), 403, done);
	});
});


describe('force error', function() {
	var shouldAllow;
	var map = [{method : '*', path : '*', check : function(req) { throw new Error('Forced error');}}];
	var runner = new MiddlewareRunner(map);

	it('should deny when assertion returns false', function(done) {
		shouldAllow = false;
		runner.runWithCheck(runner.makeReq("GET"), 403, done);
	});
});

function MiddlewareRunner(map) {

	var me = this;
	
	this.map = map;
	this.authorizer = authorizer(me.map);
	
	this.run = function(req, done) {
		var res;
		chai.connect.use(me.authorizer)
			.req(function(r) {
				r.method = req.method,
				r.url = req.url
			})
			.res(function(r) {
				r.send = function(data) {};
				res = r;
			})
			.next(function (e) {
				done(e, res);
			})
			.dispatch();
	};
	this.runWithCheck = function (req, statusCode, done) {
		me.run(req, function(err, res) {
			if(statusCode == 200)
				should.not.exist(err);
			res.statusCode.should.equal(statusCode);
			done();
		});
	}
	this.makeReq = function(method, url) {
		if(!url)
			url = "http://host/path";
		return {url: url, method : method};	
	}
}
