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

## Install Nodejs

[nodejs install guide](https://nodejs.org/en/download/package-manager/)

## Download spark-property-Manager

```bash
$ git clone https://github.com/wsapiens/spark-property-manager.git
```

or download tarball by npm

```bash
$ npm pack spark-property-manager

$ tar -xvf spark-property-manager-{version}.tgz
```

## Download dependencies

```bash
$ cd spark-property-manager
spark-property-manager $ npm install
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

Create base company and initial login user after running DB migration and generating seed data

```bash
$ psql -U username -d dbname
# SELECT COUNT(*) FROM company; -- it would be zero
# INSERT INTO company(name) VALUES ('base company'); -- create base comapny
# CREATE EXTENSION pgcrypto;
# INSERT INTO login_user(company_id, email, password, is_admin, is_manager) VALUES (1, 'email', crypt('password', gen_salt('bf')), true, true); -- create a login user with email as username and password as password for the base company
# \q
```

if sequelize db migration doesn't work, then load up from schema.sql which will create base company and initial login user

```bash
spark-property-manager$ psql -U username -d Database -a -f schema.sql
```

## Generate self-signed cert and key to run on https

```bash
$ sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout apache-selfsigned.key -out apache-selfsigned.crt
```

## Copy app.properties.TEMPLATE to app.properties and update app.properties accordingly to your environment

```bash
$ cp app.properties.TEMPLATE app.properties
$ vi app.properties
```

* app.properties example

```bash
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

If you setup this on cloud environment with domain (Named IP Address), please update url property accordingly, so account creation notification email can include correct url of this app ```url = http://your.domain.com:8080```

## Encrypt database password

* encrypt db password from command line

```bash
spark-property-manager$ node
> var crypto = require('./util/crypto');
> crypto.encrypt('mypass');
'a199/unJEhzdS5lfoF3sQe1haMc5kg=='
```

* put the encrypted password with '[encrypt]' prefix into db password field on app.properties

```bash
# contents of properties file
[db]
hostname = postgresql.host.com
port = 5432
name = dbname
dialect = postgres
username = dbuser
password = [encrypt]a199/unJEhzdS5lfoF3sQe1haMc5kg==
```

## Static code analysis by jshint and grunt

```bash
$ npm i -g grunt-cli
$ grunt
Running "jshint:files" (jshint) task
>> 46 files lint free.

Done.
```

## Static code analysis by ESLint

.eslintrc.js file contains ESLint configurations with rules

```bash
$ npm run lint

> spark-property-manager@1.1.15 lint
> eslint --ext .js app.js bin config email log migrations models routes util seeders
```

To recreate the configuration instead of editting the existing one

```bash
$ npm init @eslint/config
```

## Run unit test by mocha

* install mocha globally

```bash
$ npm i -g mocha
$ mocha
```

* install mocha locally

```bash
$ npm i mocha
$ node_modules/.bin/mocha

util
  getImportAmount()
    ✓ get negative amount for positive return amount
    ✓ get negative amount for negative return amount
    ✓ get postive amount for positive sale amount
    ✓ get positive amount for negative sale amount
  getImportDescription()
    ✓ get description with return mark
    ✓ get description without return mark
  getRandomRGB()
    ✓ get RGB number list

crypto
  encrypt()
    ✓ test encrypt
  decrypt()
    ✓ test decrypt


9 passing (23ms)
```

## Run Application

```bash
$ npm start
```

## Run Application by using Process Manager PM2

PM2 provides production level process management
[pm2 install guide](https://www.npmjs.com/package/pm2)

* install pm2

```bash
$ npm install pm2 -g
```

* run application by pm2

```bash
$ pm2 start ./bin/server.js --name "spark-property-manager" -i 8 -l pm2.log
[PM2] Starting /Users/spark/workspace3/spark-property-manager/bin/server.js in cluster_mode (8 instances)
[PM2] Done.
┌────────────────────────┬────┬─────────┬───────┬────────┬─────────┬────────┬──────┬───────────┬───────┬──────────┐
│ App name               │ id │ mode    │ pid   │ status │ restart │ uptime │ cpu  │ mem       │ user  │ watching │
├────────────────────────┼────┼─────────┼───────┼────────┼─────────┼────────┼──────┼───────────┼───────┼──────────┤
│ spark-property-manager │ 0  │ cluster │ 35491 │ online │ 0       │ 2s     │ 0%   │ 83.1 MB   │ spark │ disabled │
│ spark-property-manager │ 1  │ cluster │ 35494 │ online │ 0       │ 2s     │ 1%   │ 83.5 MB   │ spark │ disabled │
│ spark-property-manager │ 2  │ cluster │ 35511 │ online │ 0       │ 2s     │ 3%   │ 83.6 MB   │ spark │ disabled │
│ spark-property-manager │ 3  │ cluster │ 35528 │ online │ 0       │ 1s     │ 13%  │ 83.5 MB   │ spark │ disabled │
│ spark-property-manager │ 4  │ cluster │ 35547 │ online │ 0       │ 1s     │ 55%  │ 82.1 MB   │ spark │ disabled │
│ spark-property-manager │ 5  │ cluster │ 35564 │ online │ 0       │ 1s     │ 104% │ 75.2 MB   │ spark │ disabled │
│ spark-property-manager │ 6  │ cluster │ 35581 │ online │ 0       │ 0s     │ 95%  │ 54.8 MB   │ spark │ disabled │
│ spark-property-manager │ 7  │ cluster │ 35602 │ online │ 0       │ 0s     │ 77%  │ 35.8 MB   │ spark │ disabled │
└────────────────────────┴────┴─────────┴───────┴────────┴─────────┴────────┴──────┴───────────┴───────┴──────────┘
 Use `pm2 show <id|name>` to get more details about an app
```

* stop application by pm2

```bash
$ pm2 stop spark-property-manager
[PM2] Applying action stopProcessId on app [spark-property-manager](ids: 0,1,2,3,4,5,6,7)
[PM2] [spark-property-manager](0) ✓
[PM2] [spark-property-manager](1) ✓
[PM2] [spark-property-manager](2) ✓
[PM2] [spark-property-manager](3) ✓
[PM2] [spark-property-manager](4) ✓
[PM2] [spark-property-manager](5) ✓
[PM2] [spark-property-manager](6) ✓
[PM2] [spark-property-manager](7) ✓
┌────────────────────────┬────┬─────────┬─────┬─────────┬─────────┬────────┬─────┬────────┬───────┬──────────┐
│ App name               │ id │ mode    │ pid │ status  │ restart │ uptime │ cpu │ mem    │ user  │ watching │
├────────────────────────┼────┼─────────┼─────┼─────────┼─────────┼────────┼─────┼────────┼───────┼──────────┤
│ spark-property-manager │ 0  │ cluster │ 0   │ stopped │ 0       │ 0      │ 0%  │ 0 B    │ spark │ disabled │
│ spark-property-manager │ 1  │ cluster │ 0   │ stopped │ 0       │ 0      │ 0%  │ 0 B    │ spark │ disabled │
│ spark-property-manager │ 2  │ cluster │ 0   │ stopped │ 0       │ 0      │ 0%  │ 0 B    │ spark │ disabled │
│ spark-property-manager │ 3  │ cluster │ 0   │ stopped │ 0       │ 0      │ 0%  │ 0 B    │ spark │ disabled │
│ spark-property-manager │ 4  │ cluster │ 0   │ stopped │ 0       │ 0      │ 0%  │ 0 B    │ spark │ disabled │
│ spark-property-manager │ 5  │ cluster │ 0   │ stopped │ 0       │ 0      │ 0%  │ 0 B    │ spark │ disabled │
│ spark-property-manager │ 6  │ cluster │ 0   │ stopped │ 0       │ 0      │ 0%  │ 0 B    │ spark │ disabled │
│ spark-property-manager │ 7  │ cluster │ 0   │ stopped │ 0       │ 0      │ 0%  │ 0 B    │ spark │ disabled │
└────────────────────────┴────┴─────────┴─────┴─────────┴─────────┴────────┴─────┴────────┴───────┴──────────┘
 Use `pm2 show <id|name>` to get more details about an app
```

* remove application from pm2

```bash
$ pm2 delete spark-property-manager
[PM2] Applying action deleteProcessId on app [spark-property-manager](ids: 0,1,2,3,4,5,6,7)
[PM2] [spark-property-manager](0) ✓
[PM2] [spark-property-manager](1) ✓
[PM2] [spark-property-manager](2) ✓
[PM2] [spark-property-manager](3) ✓
[PM2] [spark-property-manager](4) ✓
[PM2] [spark-property-manager](5) ✓
[PM2] [spark-property-manager](6) ✓
[PM2] [spark-property-manager](7) ✓
┌──────────┬────┬──────┬─────┬────────┬─────────┬────────┬─────┬─────┬──────┬──────────┐
│ App name │ id │ mode │ pid │ status │ restart │ uptime │ cpu │ mem │ user │ watching │
└──────────┴────┴──────┴─────┴────────┴─────────┴────────┴─────┴─────┴──────┴──────────┘
Use `pm2 show <id|name>` to get more details about an app
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

## How to record expense

* Add Property from Property Manager View. Building unit will be added automatically as default unit

* Add or modify Unit for the added Property from Unit Manager View

* Add Expense with selecting Unit / Property and Expense Type, you can also upload photo copy of the receipt
  On the mobile, user will be prompted to take picture or choose photo in device.

* For importing, bank / credit card statement, it needs to be flat file (.csv) format
  Each bank and credit card company has different formation, so need to define column number for data type/kind first.
  Once setup import column configuration on Import Manager view, load up .csv file to populate expenses
