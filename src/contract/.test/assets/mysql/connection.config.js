// note: this connection config is defined in /provision/testdb/docker-compose
const promiseConfig = async () => {
	return {
		host: "localhost",
		port: 12821,
		database: "superimportantdb",
		schema: "superimportantdb",
		username: "root",
		password: "a-secure-password",
	};
};

module.exports = {
	promiseConfig,
};
