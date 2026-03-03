module.exports = {
  output: 'export', // Added this for static export
  swcMinify: false,
  trailingSlash: true,
  env: {
    // HOST
    HOST_API_KEY: 'https://api.creddot.com/api/user/',
    // HOST_API_KEY: 'http://localhost/trybesave/api/user',
  },
};
