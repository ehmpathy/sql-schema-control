// note: this connection config is defined in /provision/integration_test_db/docker-compose
const promiseConfig = async () => {
  return {
    host: 'localhost',
    port: 12821,
    schema: 'superimportantdb',
    username: 'root',
    password: 'a-secure-password',
  };
};

module.exports = {
  promiseConfig,
};
