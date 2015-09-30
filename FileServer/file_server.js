var http = require( 'http' );
var fs = require('fs');

function server_fun( req, res )
{
    //console.log( req.url );
    res.writeHead( 200 );
    var subString = req.url.substring(1, req.url.length);

    try
    {
      var fileBuffer = fs.readFileSync(subString);
      var content = fileBuffer.toString();
      res.end(content);
    }
    catch(exp)
    {
      res.end("Failed to read file " + subString);
    }
}

var server = http.createServer( server_fun );

server.listen(8080);
