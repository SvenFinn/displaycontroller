#!/bin/bash

host="$1"
name="$2"
user="$3"
pass="$4"

cat > ./servers.json <<EOF
{
    "Servers": {
        "1": {
            "Name": "Displaycontroller",
            "Group": "Servers",
            "Host": "$host",
            "Port": 5432,
            "Shared": true,
            "Username": "$user",
            "MaintenanceDB": "$name",
            "PassFile": "/pgPass"
        }
    }
}
EOF


echo "$host:5432:$name:$user:$pass" > ./pgPass
echo "$host:5432:postgres:$user:$pass" >> ./pgPass