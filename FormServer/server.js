var http = require( 'http' );
var fs = require('fs');

function getFormValuesFromURL(url)
{
  var kvs = {};
  var parts = url.split("?");
  var key_value_pairs = parts[1].split("&");
  for(var i = 0; i < key_value_pairs.length; i++)
  {
    var key_value = key_value_pairs[i].split("=");
    kvs[ key_value[0] ] = key_value[1];
  }
  return kvs;
}

function server_fun( req, res )
{
    res.writeHead( 200 );
    var subString = "./" + req.url;

    try
    {
      var fileBuffer = fs.readFileSync(subString);
      var content = fileBuffer.toString();
      res.end(content);
    }
    catch(excep)
    {
      if (req.url.indexOf("form?") >= 0)
      {
        res.writeHead(200);
        var kvs = getFormValuesFromURL(req.url);
        var input_to_write = kvs["input"];
        var contents = "";

        try
        {
          contents += fs.readFileSync("form.log").toString();
        }
        catch(excep)
        {
          var f = fs.openSync("form.log", "a");
          fs.closeSync(f);
        }

        contents += input_to_write + "\n";
        fs.writeFile("form.log", contents);
        res.end("Submitted " + input_to_write + " to form!");
        //res.end(form.html);
      }
      else
      {
        res.writeHead(404);
        res.end("Failed to read file " + subString);
      }
    }
}

var server = http.createServer( server_fun );

server.listen(8080);
