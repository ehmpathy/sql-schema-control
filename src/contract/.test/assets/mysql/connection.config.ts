// note: this connection config is defined in /provision/testdb/docker-compose
export const promiseConfig = async () => ({
  host: 'localhost',
  port: 12821,
  database: 'superimportantdb',
  username: 'root',
  password: 'a-secure-password',
});
