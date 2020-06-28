// note: this connection config is defined in /provision/integration_test_db/docker-compose
export const promiseConfig = async () => ({
  mysql: {
    host: 'localhost',
    port: 12821,
    schema: 'superimportantdb',
    username: 'root',
    password: 'a-secure-password',
  },
  postgresql: {
    host: 'localhost',
    port: 7821,
    schema: 'superimportantdb',
    username: 'postgres',
    password: 'a-secure-password',
  },
});
