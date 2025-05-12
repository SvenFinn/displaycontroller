#!/bin/bash

# Stop the mariadb service
echo -n "Stopping mariadb service..."
systemctl stop mariadb
echo "done"

# Start mariadb in safe mode
echo -n "Starting mariadb in safe mode..."
mysqld_safe --skip-grant-tables --skip-networking > /dev/null 2>&1 &

# Wait for MySQL to start by checking the socket file
while ! mysqladmin ping --silent >/dev/null; do
	sleep 1
done
echo "done"

# Allow connecting to the database
echo -n "Allowing meyton to access the database..."
mysql -u root <<EOF
FLUSH PRIVILEGES;
GRANT SELECT ON SMDB.* TO 'meyton'@'%';
FLUSH PRIVILEGES;
EOF
echo "done"

# Restart the mariadb service
echo -n "Restarting mariadb service..."
killall mariadbd
systemctl start mariadb
echo "done"
