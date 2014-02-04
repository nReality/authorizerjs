TESTS = tests/*.js
MOCHA_OPTS= --check-leaks
REPORTER = dot

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(TESTS)

test-cov: lib-cov
	AUTH_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov: clean
	@jscoverage lib lib-cov

clean:
	rm -f coverage.html
	rm -fr lib-cov

.PHONY: test-cov test 
