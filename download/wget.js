var fs = require('fs');
var http = require('http');

if(process.argv.length < 3)
{
  console.log("Usage: Need a filename");
  process.exit(-1);
}

var filename = process.argv[2];
try
{
  var fileBuffer = fs.readFileSync(filename);
}
catch(exp)
{
  console.log("Failed to read file", filename);
  process.exit(2);
}
var contents = fileBuffer.toString();
var contents_lines = contents.split('\n');
for(var i = 0; i < contents_lines.length; i++)
{
  var parts = contents_lines[i].split(' ');
	var dest = parts[0];
  var url = parts[1];
  try
  {
    var f = fs.openSync(dest, "w");
    fs.closeSync(f);
  }
  catch(exp)
  {
    console.log("ERROR: Line " + (i+1) + " has an invalid destination: " + dest);
    continue;
  }

  download(url, dest, i);
  //console.log("Attempting download for line " + (i+1) + ".");
}

function download(url, dest, i)
{
	var file = fs.createWriteStream(dest);

  var request = http.get(url, function(response) {
    response.pipe(file);
    console.log("Line " + (i+1) + " downloaded successfully");
  } );

  request.on( 'error', function( err ) {
    console.log( "ERROR: Line " + (i+1) + " has an invalid source address: " + url);
    //fs.unlink(dest, callback);
    //fs.unlinkSync(dest);
  } );
}
