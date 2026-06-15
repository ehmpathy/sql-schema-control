#!/usr/bin/env bash
######################################################################
# .what = start local testdb (docker postgres + mysql)
#
# .why  = integration tests require real database instances.
#         this skill provisions postgres and mysql via docker.
#
# .when = use before:
#         - npm run test:integration
#         - manual database exploration
#
# usage:
#   rhx use.testdb
#
# prerequisites:
#   - docker daemon active
#
# provides:
#   - postgres at localhost:7821
#   - mysql at localhost:13306
#
# guarantee:
#   - removes stale containers if present
#   - starts fresh testdb via docker compose
#   - fail-fast on errors
######################################################################
set -euo pipefail

# remove stale containers by name (docker:clear only removes by port)
echo "🧹 remove stale containers if present..."
docker rm -f superimportantdb 2>/dev/null || true
docker rm -f importantdb 2>/dev/null || true

# start the testdb
echo "🐢 start testdb..."
npm run start:testdb
