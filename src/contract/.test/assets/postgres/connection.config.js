// note: this connection config is defined in /provision/integration_test_db/docker-compose
const promiseConfig = async () => {
	return {
		host: "localhost",
		port: 7821,
		database: "superimportantdb",
		schema: "superimportantdb",
		username: "postgres",
		password: "a-secure-password",
	};
};

module.exports = {
	promiseConfig,
};
