var express = require('express');
var server = express();
server.configure(function() {
  server.use(express.static(__dirname));
});

server.listen(process.env.PORT || 3000);
