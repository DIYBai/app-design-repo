var fs = require( 'fs' );
var http = require( 'http' );
var sql = require( 'sqlite3' ).verbose();

function getFormValuesFromURL( url )
{
    var kvs = {};
    var parts = url.split( "?" );
    var key_value_pairs = parts[1].split( "&" );
    for( var i = 0; i < key_value_pairs.length; i++ )
    {
        var key_value = key_value_pairs[i].split( "=" );
        kvs[ key_value[0] ] = key_value[1];
    }
    // console.log( kvs );
    return kvs
}

function server_fun( req, res )
{
    var filename = "./" + req.url;
    try {
        var contents = fs.readFileSync( filename ).toString();
        res.writeHead( 200 );
        res.end( contents );
    }
    catch( exp ) {
        // console.log( "huh?", req.url.indexOf( "second_form?" ) );
        if(req.url.indexOf("get_performer_info?") >= 0)
        {
          var kvs = getFormValuesFromURL( req.url );
          var db = new sql.Database( 'telluride.sqlite' );
          var values = "('";
          db.all("SELECT * FROM Performers WHERE ID = ?",
                kvs['perf_id'],       //don't trust 'kvsp['perf_id']' part; check first
          // db.all("SELECT * FROM Performers",
								function(err,rows){
										if (err)
										{
											res.writeHead(200);
											res.end("ERROR: " + err);
										}
										else
										{
                      console.log("entered");
											res.writeHead(200);
											var response_text = "<html><body><table><tbody>";
											for(var i = 0; i < rows.length; i++)
											{
												response_text += "<tr><td>" + rows[i].Name + "</td><td>" + rows[i].GroupSize + "</td></tr>";
											}
                      response_text += "</tbody></table></body></html>";
											res.end(response_text);
										}
								})

        }
        else if( req.url.indexOf( "performances_after?" ) >= 0 )
        {
            var kvs = getFormValuesFromURL( req.url );
            var db = new sql.Database( 'telluride.sqlite' );
            //console.log(kvs['timeInput']);
            db.all( 'SELECT Performers.Name as PerfName, * '+
                    'FROM Performances '+
                        'JOIN Performers ON Performers.ID = Performances.PID '+
                        'JOIN Stages ON Stages.ID = Performances.SID ',//+
                    // 'WHERE Time > ?',
                    // kvs['timeInput'],
                    function( err, rows ) {
                        res.writeHead( 200 );
                        resp_text = "<table><tr style='font-weight: bold'><td>Performer</td><td> | Stage</td><td> | Time</td></tr>";
                        var hourInput = kvs['timeInput'].substring(0, 2);
                        hourInput = parseInt(hourInput, 10);
                        var minuteInput = kvs['timeInput'].substring(5, 7);
                        minuteInput = parseInt(minuteInput, 10);
                        //console.log("Input: " + hourInput + " | " + minuteInput);
                        for(var i = 0; i < rows.length; i++)
  											{
                          var hourDatum = rows[i].Time.substring(0, rows[i].Time.indexOf(':'));
                          hourDatum = parseInt(hourDatum, 10);
                          var minuteDatum = rows[i].Time.substring(rows[i].Time.length-2, rows[i].Time.length);
                          minuteDatum = parseInt(minuteDatum, 10);
                          //console.log(hourDatum + " | " + minuteDatum);
                          if( hourDatum > hourInput || (hourDatum == hourInput && minuteDatum > minuteInput) )
                          {
  												  resp_text += "<tr><td>" + rows[i].PerfName + "</td><td> | " + rows[i].Name + "</td><td> | " + rows[i].Time + "</td></tr>";
                          }
  											}
                        resp_text += "</table>";
                        res.end(resp_text );
                    } );
        }
        else
        {
            // console.log( exp );
            res.writeHead( 404 );
            res.end( "Cannot find file: "+filename );
        }
    }
}

var server = http.createServer( server_fun );

server.listen( 8080 );
