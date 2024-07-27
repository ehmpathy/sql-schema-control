# Changelog

## [1.5.3](https://github.com/ehmpathy/sql-schema-control/compare/v1.5.2...v1.5.3) (2024-07-27)


### Bug Fixes

* **practs:** bump practs to latest best ([662975f](https://github.com/ehmpathy/sql-schema-control/commit/662975f00b9a8a073448f107b7163a2d8e037d13))

## [1.5.2](https://github.com/ehmpathy/sql-schema-control/compare/v1.5.1...v1.5.2) (2024-07-27)


### Bug Fixes

* **practs:** bump practs to latest best ([a8a9c63](https://github.com/ehmpathy/sql-schema-control/commit/a8a9c63a6076937e7cc04904754058d8abc83eb0))

## [1.5.1](https://github.com/ehmpathy/sql-schema-control/compare/v1.5.0...v1.5.1) (2023-02-12)


### Bug Fixes

* **deps:** add ts-node dependency for the bin executable ([96a73be](https://github.com/ehmpathy/sql-schema-control/commit/96a73be06b4d100b7486bb4a89c908e2f1c1d33c))

## [1.5.0](https://github.com/ehmpathy/sql-schema-control/compare/v1.4.0...v1.5.0) (2023-02-12)


### Features

* **display:** use relative file path when outputting info about plans, for easy navigation ([301a410](https://github.com/ehmpathy/sql-schema-control/commit/301a410e75a6c582429f4f3353e6b666d0d25b69)), closes [#24](https://github.com/ehmpathy/sql-schema-control/issues/24)


### Bug Fixes

* **cicd:** ensure integration test is provisioned before deploy test ([2f0f9a0](https://github.com/ehmpathy/sql-schema-control/commit/2f0f9a0aae9952838ad45e0c985b21637d0407c2))
* **cicd:** remove differences in tests in cicd and local env ([8d14c2b](https://github.com/ehmpathy/sql-schema-control/commit/8d14c2b2abcdebdde56d3cc04530b0adbe826c86))
* **deps:** bump oclif and ts to fix security warnings ([7f874d3](https://github.com/ehmpathy/sql-schema-control/commit/7f874d37f9ce0069edb97af8f6073464cc20c8d1))
* **deps:** remove unused deps per depcheck ([c59ca4c](https://github.com/ehmpathy/sql-schema-control/commit/c59ca4ca0e7f7384317d74d24ed7ff59d9f8a8bd))
* **deps:** upgrade deps to remove audited vulnerabilities ([f756834](https://github.com/ehmpathy/sql-schema-control/commit/f7568348e29aa45956253635ac7ded6ad999f48c))
* **diff:** fix determining diff for VIEW resource, make sure double parens removal is more constrained ([b954d9f](https://github.com/ehmpathy/sql-schema-control/commit/b954d9f5af7f9a3ab3554193bf8a442f86b4eda0))
* **dist:** move .sql file out of /src into /schema, so that it doesn't get wiped during tsc ([c874ddb](https://github.com/ehmpathy/sql-schema-control/commit/c874ddb61301618f3895b32f28648a3a245dbcf1))
* **format:** apply prettier changes post bestpracts upgrade ([df2354a](https://github.com/ehmpathy/sql-schema-control/commit/df2354afba955c716338e706e4a22585007871f9))
* **norm:** ensure all schema qualifier removed from diff if expected schema ([8874bba](https://github.com/ehmpathy/sql-schema-control/commit/8874bbac6d972cbfdc601192bb1be3029119a0fb))
* **practs:** upgrade to domain/objects best practice ([b3c140c](https://github.com/ehmpathy/sql-schema-control/commit/b3c140c609d9d33943e04111680373e77df48ef1))
* **practs:** upgrade to latest best practices per declapract-typescript-ehmpathy ([be703c1](https://github.com/ehmpathy/sql-schema-control/commit/be703c16f8b4677967d0539102e527a8b4c718e5))
* **resource:** ensure that redundant aliases and join wrapping parens dont affect diff for VIEW ([f6e9f7f](https://github.com/ehmpathy/sql-schema-control/commit/f6e9f7f1b1fa63cb4b42beb1cce13f6dfd80da99))
* **tests:** resolve breaking changes in joi post upgrade ([1f63f0d](https://github.com/ehmpathy/sql-schema-control/commit/1f63f0df089a8ba703cd292b6385e69509e79ed5))
* **types:** resolve type errors after typescript upgrade ([bfba1f8](https://github.com/ehmpathy/sql-schema-control/commit/bfba1f8876ffd56fd38d314bafae76776c95424a))

## [1.5.0](https://github.com/ehmpathy/sql-schema-control/compare/v1.4.0...v1.5.0) (2023-02-12)


### Features

* **display:** use relative file path when outputting info about plans, for easy navigation ([301a410](https://github.com/ehmpathy/sql-schema-control/commit/301a410e75a6c582429f4f3353e6b666d0d25b69)), closes [#24](https://github.com/ehmpathy/sql-schema-control/issues/24)


### Bug Fixes

* **cicd:** remove differences in tests in cicd and local env ([8d14c2b](https://github.com/ehmpathy/sql-schema-control/commit/8d14c2b2abcdebdde56d3cc04530b0adbe826c86))
* **deps:** bump oclif and ts to fix security warnings ([7f874d3](https://github.com/ehmpathy/sql-schema-control/commit/7f874d37f9ce0069edb97af8f6073464cc20c8d1))
* **deps:** remove unused deps per depcheck ([c59ca4c](https://github.com/ehmpathy/sql-schema-control/commit/c59ca4ca0e7f7384317d74d24ed7ff59d9f8a8bd))
* **deps:** upgrade deps to remove audited vulnerabilities ([f756834](https://github.com/ehmpathy/sql-schema-control/commit/f7568348e29aa45956253635ac7ded6ad999f48c))
* **diff:** fix determining diff for VIEW resource, make sure double parens removal is more constrained ([b954d9f](https://github.com/ehmpathy/sql-schema-control/commit/b954d9f5af7f9a3ab3554193bf8a442f86b4eda0))
* **dist:** move .sql file out of /src into /schema, so that it doesn't get wiped during tsc ([c874ddb](https://github.com/ehmpathy/sql-schema-control/commit/c874ddb61301618f3895b32f28648a3a245dbcf1))
* **format:** apply prettier changes post bestpracts upgrade ([df2354a](https://github.com/ehmpathy/sql-schema-control/commit/df2354afba955c716338e706e4a22585007871f9))
* **norm:** ensure all schema qualifier removed from diff if expected schema ([8874bba](https://github.com/ehmpathy/sql-schema-control/commit/8874bbac6d972cbfdc601192bb1be3029119a0fb))
* **practs:** upgrade to domain/objects best practice ([b3c140c](https://github.com/ehmpathy/sql-schema-control/commit/b3c140c609d9d33943e04111680373e77df48ef1))
* **practs:** upgrade to latest best practices per declapract-typescript-ehmpathy ([be703c1](https://github.com/ehmpathy/sql-schema-control/commit/be703c16f8b4677967d0539102e527a8b4c718e5))
* **resource:** ensure that redundant aliases and join wrapping parens dont affect diff for VIEW ([f6e9f7f](https://github.com/ehmpathy/sql-schema-control/commit/f6e9f7f1b1fa63cb4b42beb1cce13f6dfd80da99))
* **tests:** resolve breaking changes in joi post upgrade ([1f63f0d](https://github.com/ehmpathy/sql-schema-control/commit/1f63f0df089a8ba703cd292b6385e69509e79ed5))
* **types:** resolve type errors after typescript upgrade ([bfba1f8](https://github.com/ehmpathy/sql-schema-control/commit/bfba1f8876ffd56fd38d314bafae76776c95424a))
