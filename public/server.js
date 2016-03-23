var staticServer = require('node-static');

//
// Create a node-static server instance to serve the './public' folder
//
var file = new staticServer.Server('./', {indexFile: 'index.html'});

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(request, response);
    }).resume();
}).listen(8080);

var open = require("open");
open("http://127.0.0.1:8080");