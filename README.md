# Spark Property Manager
A Realestate Property Management WebApplication to manage BooKeeping and WorkOrder easy

- Technologies: Nodejs, postgresql

## Step To Setup
## Postgresql
```bash
$ sudo apt-get update
$ sudo apt-get install postgresql postgresql-contrib
```

## Create User and Database
```bash
$ createuser -P -s dbusername --createdb
```
If that doesn't create user with creating db
```bash
$ sudo -u postgres psql
# CREATE USER username WITH PASSWORD 'password';
# ALTER USER username SUPERUSER;
# CREATE DATABASE dbname OWNER username;
```

## Download spark-property-Manager
```bash
$ git clone https://github.com/wsapiens/spark-property-manager.git
```

## Run schema.sql to your Database
```bash
spark-property-manager$ psql -U username -d Database -a -f schema.sql
```

## Install Nodejs
[nodejs install guide] (https://nodejs.org/en/download/package-manager/)

## Download dependencies
```bash
$ npm install
```

## Copy app.properties.TEMPLATE to app.properties and update app.properties accordingly to your environment
```bash
$ cp app.properties.TEMPLATE app.properties
$ vi app.properties
```
Generate self-signed cert and key to run on https
```bash
$ sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout apache-selfsigned.key -out apache-selfsigned.crt
```

* app.properties
```
# contents of properties file
[db]
hostname = postgresql.host.com
port = 5432
name = dbname
dialect = postgres
username = dbuser
password = dbpass

[app]
hostname = localhost
port = 8080
https = false
serverkey = /path/to/server.key
servercert = /path/to/server.crt
url = http://localhost:8080

[log]
file = app.log
level = error

[smtp]
username = smtpUsername
password = smtpPassword
hostname = smtpHostname
port = 465
ssl = true
tls = false
```

## Run application
```bash
$ npm start
```

## Open by Browser
http://localhost:8080

## Create Account by Valid Email address and it will send temporary password to your email

## Login and Change password

## Setup your router with named IP address and fort forwarding
