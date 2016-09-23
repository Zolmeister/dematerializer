var connect = require('connect');
var http = require('http');

var app = connect();

app.use('/ping', function (req, res) {
  res.end('pong')
})

app.use(connect.static(__dirname+'/app'))

http.createServer(app).listen(process.env.PORT || 3000)
