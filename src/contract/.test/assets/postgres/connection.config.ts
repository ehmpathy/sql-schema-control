// note: this connection config is defined in /provision/integration_test_db/docker-compose
export const promiseConfig = async () => ({
  host: 'localhost',
  port: 7821,
  database: 'superimportantdb',
  schema: 'superimportantdb',
  username: 'postgres',
  password: 'a-secure-password',
});
