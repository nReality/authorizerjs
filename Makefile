TESTS = test/*.js
REPORTER = dot

test:
		@NODE_ENV=test ./node_modules/.bin/mocha \
					--reporter $(REPORTER) \
							$(TESTS)

test-cov: lib-cov
		@CONNECT_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
		@jscoverage lib $@

benchmark:
		@./support/bench

.PHONY: test-cov test benchmark



MOCHA_OPTS= --check-leaks

REPORTER = dot

check: test

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--globals setImmediate,clearImmediate \
		$(MOCHA_OPTS)

test-cov: lib-cov
	@EXPRESS_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@jscoverage lib lib-cov

clean:
	rm -f coverage.html
	rm -fr lib-cov

.PHONY: test test-unit test-acceptance bench clean
