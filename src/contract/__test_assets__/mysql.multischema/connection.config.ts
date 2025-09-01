// note: this connection config is defined in /provision/integration_test_db/docker-compose
export const promiseConfig = async () => ({
  host: 'localhost',
  port: 12821,
  database: 'superimportantdb',
  username: 'root',
  password: 'a-secure-password',
});
