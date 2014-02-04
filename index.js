module.exports = process.env.AUTH_COV
  ? require('./lib-cov/authorizer')
  : require('./lib/authorizer');
