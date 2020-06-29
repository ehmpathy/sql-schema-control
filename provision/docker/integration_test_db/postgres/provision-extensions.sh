#!/bin/sh
# provision any extensions required

echo "provisioning postgres extensions..."
psql "dbname=$POSTGRES_DB host=localhost user=postgres password=$POSTGRES_ROOT_PASSWORD port=5432" -f /root/extensions.sql # runn the extensions.sql file
echo "provisioned postgres extensions successfully"
