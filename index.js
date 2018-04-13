const express = require('express');
const bodyParser = require('body-parser');
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('app.properties');
const { Pool, Client } = require('pg'); // PostgreSql DB Client
const pool = new Pool({
   host: properties.get('db.hostname'),
   port: Number(properties.get('db.port')),
   database: properties.get('db.name'),
   user: properties.get('db.username'),
   password: properties.get('db.password'),
});
const app = express();
const port = 8080;

app.use(bodyParser.json());

var audit = {};

app.get('/properties', function(req, res) {
  pool.query('select * from property')
      .then(rs => {
        console.log(rs.rows);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(rs.rows));
      }).catch(e => {
        console.error(e.stack);
        res.send(e.stack);
      });
});

app.get('/expenses', function(req, res) {
  pool.query('select * from expense')
      .then(rs => {
        console.log(rs.rows);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(rs.rows));
      }).catch(e => {
        console.error(e.stack);
        res.send(e.stack);
      });
});

app.get('/api/v1/import/projects/123', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({"audit": audit}));
});

app.post('/api/v1/import/projects', function(req, res) {
  var body = req.body;
  console.log("[ Received Import Projects ]\n")
  console.log(JSON.stringify(req.body));

  var projects = body["projects"];
  //console.log(projects);

  var header = {
    "texturaJobID": 123,
    "totalDuplicate": 0,
    "totalError": 0,
    "totalInfo": 0,
    "totalSuccess": projects.length
  }

  var messages = [];
  for(i = 0; i < projects.length; i++) {
    var projectNumber = projects[i]["number"];
    var message = {
      "mainJobNumber": projectNumber,
      "status": "SUCCESS",
      "formattedMessage": "Project '"+ projectNumber + "' was successfully created",
      "isoDateTime": "2017-03-03T14:18:34.406851"
    }
    messages.push(message);
  }

  audit["importMessageSummary"] = header;
  audit["messages"] = messages;
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({"uri": "http://localhost:"+port+"/api/v1/import/projects/123"}));
});
 
app.listen(properties.get('app.port'));
