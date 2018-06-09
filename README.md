# Spark Property Manager
A Real Estate Property Management WebApplication to manage Bookkeeping and WorkOrder easy. Write Up expense to each property unit with uploading receipt image or bulk upload your bank account statement as flat file with configuring columns

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
# \q
```

Login by the created user and create pgcrypto extension for password encryption
```bash
$ psql -U username -d dbname
# CREATE EXTENSION pgcrypto;
# \q
```

## Memcached
Install and start Memcached
```bash
$ sudo apt-get update
$ sudo apt-get install memcached
$ sudo apt-get install libmemcached-tools
$ sudo systemctl restart memcached
```

## Download spark-property-Manager
```bash
$ git clone https://github.com/wsapiens/spark-property-manager.git
```

## Run database migration
First, setup sequelize CLI config.json
```bash
$ vi config/config.json
```
```json
{
  "development": {
    "username": "dbuser",
    "password": "dbpass",
    "database": "dbname",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },

}
```

Run DB migration and generate seed data
```bash
$ node_modules/.bin/sequelize db:migrate
$ node_modules/.bin/sequelize db:seed:all
```


if sequelize db migration doesn't work, then load up from schema.sql
```bash
spark-property-manager$ psql -U username -d Database -a -f schema.sql
```

## Install Nodejs
[nodejs install guide](https://nodejs.org/en/download/package-manager/)

## Download dependencies
```bash
$ npm install
```

## Copy app.properties.TEMPLATE to app.properties and update app.properties accordingly to your environment
```bash
$ cp app.properties.TEMPLATE app.properties
$ vi app.properties
```
* Generate self-signed cert and key to run on https
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
sessionSecret = secret
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
If you setup this on cloud environment with domain (Named IP Address), please update url property accordingly, so account creation notification email can include correct url of this app
```url = http://your.domain.com:8080```

## Run application
```bash
$ npm start
```

## Open by Browser
http://localhost:8080

## Create Account by Valid Email address and it will send temporary password to your email
![alt text][account_creation]

## Login by temporary password sent to your email
![alt text][login]

## Change password
![alt text][password_change]


[account_creation]: https://github.com/wsapiens/spark-property-manager/blob/master/doc/account_creation.png

[login]:
https://github.com/wsapiens/spark-property-manager/blob/master/doc/login.png

[password_change]:
https://github.com/wsapiens/spark-property-manager/blob/master/doc/password_change.png
