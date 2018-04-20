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
$ sudo -u postgres psql
```
```bash
$ createuser -P -s dbusername --createdb
```

## Download spark-property-Manager
```bash
$git clone https://github.com/wsapiens/spark-property-manager.git
```

## Run schema.sql to your Database
```bash
spark-property-manager$ psql -U username -d Database -a -f schema.sql
```

## Install Nodejs
https://nodejs.org/en/

## Download dependencies
```bash
$ npm install
```

## Update properties
```bash
$ vi app.properties
```

## Run application
```bash
$ npm start
```

## Open by Browser
http://localhost:8080

## Login by default admin user credential 'email'/'password'

## Setup your router with named IP address and fort forwarding
