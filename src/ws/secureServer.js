var fs = require('fs');
var WebSocketServer = require('ws').Server;
var express = require('express');
var https = require('https');
var path = require('path');
var accelerometer = require('./acceleromter');


var currentStatus={};
accelerometer(function() {
  currentStatus.x = this.x;
  currentStatus.y = this.y;
  currentStatus.z = this.z;
  currentStatus.pitch = this.pitch;
  currentStatus.roll = this.roll;
  currentStatus.acceleration = this.acceleration;
  currentStatus.inclination = this.inclination;
  currentStatus.orientation = this.orientation;
  currentStatus.epoch = Date.now();
});



var privateKey  = fs.readFileSync('sslcert/key.pem', 'utf8');
var certificate = fs.readFileSync('sslcert/cert.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var app = express();
var httpsServer = https.createServer(credentials, app);
app.use(express.static(path.join(__dirname, '/public')));
httpsServer.listen(8443);


var wss = new WebSocketServer({server: httpsServer});
wss.on('connection', function (ws) {
  var id = setInterval(function () {
    ws.send(JSON.stringify(currentStatus), function () { /* ignore errors */ });
  }, 100);
  console.log('started client interval');
  ws.on('close', function () {
    console.log('stopping client interval');
    clearInterval(id);
  });
});
