var connect = require('connect');
connect.createServer(
    connect.static(__dirname+'/app')
).listen(process.env.PORT || 3000);
