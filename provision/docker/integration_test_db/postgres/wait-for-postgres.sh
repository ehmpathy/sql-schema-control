#!/bin/sh
# wait until postgres is really available
maxcounter=45

echo "waiting for postgres server to begin accepting connections..."
counter=1
while ! psql "dbname=$POSTGRES_DB host=localhost user=postgres password=$POSTGRES_PASSWORD port=5432" -c '\l' > /dev/null 2>&1; do
    sleep 1
    counter=`expr $counter + 1`
    if [ $counter -gt $maxcounter ]; then
        >&2 echo "we have been waiting for postgres too long already; failing"
        exit 1
    fi;
done
echo "connected to postgres instance successfuly"
