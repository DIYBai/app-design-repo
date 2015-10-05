var fs = require( 'fs' );
var http = require( 'http' );
var sql = require( 'sqlite3' );//.verbose();

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
    return kvs;
}

function server_fun( req, res )
{
    var filename = "./" + req.url;
    try
		{
        var contents = fs.readFileSync( filename ).toString();
        res.writeHead( 200 );
        res.end( contents );
    }
    catch( exp ) {
        if( req.url.indexOf( "go_back?"  ) >= 0 )
        {
          var contents = fs.readFileSync( './form.html' ).toString();
          res.writeHead( 200 );
          res.end( contents );
        }
        if( req.url.indexOf( "get_data?" ) >= 0 )
        {
          var kvs = getFormValuesFromURL( req.url );
          var firstTime = kvs['minTime'];
          var hour1;
          var minute1;

          var secondTime = kvs['maxTime'];
          var hour2;
          var minute2;

          var hasValidRange = false;
          if (firstTime.length > 0 && secondTime.length > 0)
          {
            hour1 = parseInt(firstTime.substring(0,2) , 10);
            hour2 = parseInt(secondTime.substring(0,2), 10);
            minute1 = parseInt(firstTime.substring(5,7) , 10);
            minute2 = parseInt(secondTime.substring(5,7) , 10);
            if(hour1 == hour2)
            {
              hasValidRange = minute2 > minute1;
            }
            else
            {
              hasValidRange = hour2 > hour1;
            }
          }

          var db = new sql.Database( 'weather.sqlite' );
          db.all( "SELECT * FROM Weather", function( err, rows ) {
            res.writeHead( 200 );
            var resp_text ="<head><link rel='stylesheet' type='text/css' href='pretty.css'></head>" +
            "<div><table><tr class='header'><td style='min-width:69px'>Time </td>" +
            "<td style='min-width: 82px'> | Temp (*F)</td>           <td style='min-width: 81px'> | Dew Point </td>" +
            "<td style='min-width: 76px'> | Humidity </td>           <td style='min-width:162px'> | Sea-level Pressure (in) </td>" +
            "<td style='min-width: 68px'> | Visiblity </td>          <td style='min-width:116px'> | Wind Direction </td>" +
            "<td style='min-width:139px'> | Wind Speed (mph) </td>   <td style='min-width:134px'> | Gust Speed (mph) </td>" +
            "<td style='min-width:127px'> | Precipitation (in) </td> <td style='min-width: 56px'> | Events </td>" +
            "<td style='min-width:119px'> | Conditions </td>         <td style='min-width:182px'> | Wind Direction (degrees) </td>" +
            "<td style='min-width:145px'> | Date </td> </tr>";

            if(hasValidRange)
            {
              for(var i = 0; i < rows.length; i++)
              {
                var timeData = rows[i].timeString;
                var hourData = timeData.match(/[0-9]+:/)
                hourData = parseInt(hourData[0].substring(0, hourData[0].indexOf(':') , 10));
                var minData = timeData.match(/:[0-9][0-9]/)
                minData = parseInt(minData[0].substring(1, 3) , 10);
                if(timeData.indexOf('P') >= 0 && hourData != 12)
                {
                  hourData += 12;
                }
                if(timeData.indexOf('A') >= 0 && hourData == 12)
                {
                  hourData -= 12;
                }

                var validTime = false;
                if(hourData == hour1)
                {
                  validTime = minData >= minute1;
                  console.log("1: " + hourData + ":" + minData + " " + validTime);
                }
                else if(hourData == hour2)
                {
                  validTime = minData <= minute2;
                  console.log("2: " + hourData + ":" + minData + " " + validTime);
                }
                else
                {
                  validTime = (hourData > hour1 && hourData < hour2);
                  console.log("3: " + hourData + ":" + minData + " " + validTime + " " + hour1 + " " + hour2);
                }

                if(validTime)
                {
                  resp_text += "<tr> <td>";
                  if ( (hourData >= 0 && hourData < 10) || (hourData > 12 && hourData < 22) )
                  {
                    resp_text+="0";
                  }
                  resp_text += timeData + "</td>";
                  resp_text += "<td> | " + rows[i].temp + "</td>";
                  resp_text += "<td> | " + rows[i].dewPoint + "</td>";
                  resp_text += "<td> | " + rows[i].humidity + "</td>";
                  resp_text += "<td> | " + rows[i].seaLevelPressure + "</td>";
                  resp_text += "<td> | " + rows[i].visibility + "</td>";
                  resp_text += "<td> | " + rows[i].windDirection + "</td>";
                  resp_text += "<td> | " + rows[i].windSpeed + "</td>";
                  resp_text += "<td> | " + rows[i].gustSpeed + "</td>";
                  resp_text += "<td> | " + rows[i].precipitation + "</td>";
                  resp_text += "<td> | " + rows[i].events + "</td>";
                  resp_text += "<td> | " + rows[i].conditions + "</td>";
                  resp_text += "<td> | " + rows[i].windDirectionDegrees + "</td>";
                  resp_text += "<td> | " + rows[i].date + "</td>";
                  resp_text += "</tr>";
                }
                //go on to next iteration of for-loop
              }
              //end of if statement
            }
            else
            {
              for(var i = 0; i < rows.length; i++)
              {
                var timeData = rows[i].timeString;
                var hourData = timeData.match(/[0-9]+:/)
                hourData = parseInt(hourData[0].substring(0, hourData[0].indexOf(':') , 10));
                if(timeData.indexOf('P') >= 0 && hourData != 12)
                {
                  hourData += 12;
                }
                if(timeData.indexOf('A') >= 0 && hourData == 12)
                {
                  hourData -= 12;
                }

                resp_text += "<tr> <td>";
                if ( (hourData >= 0 && hourData < 10) || (hourData > 12 && hourData < 22) )
                {
                  resp_text+="0";
                }
                resp_text += timeData + "</td>";
                resp_text += "<td> | " + rows[i].temp + "</td>";
                resp_text += "<td> | " + rows[i].dewPoint + "</td>";
                resp_text += "<td> | " + rows[i].humidity + "</td>";
                resp_text += "<td> | " + rows[i].seaLevelPressure + "</td>";
                resp_text += "<td> | " + rows[i].visibility + "</td>";
                resp_text += "<td> | " + rows[i].windDirection + "</td>";
                resp_text += "<td> | " + rows[i].windSpeed + "</td>";
                resp_text += "<td> | " + rows[i].gustSpeed + "</td>";
                resp_text += "<td> | " + rows[i].precipitation + "</td>";
                resp_text += "<td> | " + rows[i].events + "</td>";
                resp_text += "<td> | " + rows[i].conditions + "</td>";
                resp_text += "<td> | " + rows[i].windDirectionDegrees + "</td>";
                resp_text += "<td> | " + rows[i].date + "</td>";
                resp_text += "</tr>";
              }
            }
            resp_text += "</table> </div>"
            resp_text += "<br><form action='/go_back'><input type='submit' " +
            "value='Go back'></input></form>";
            res.end(resp_text);
            //end of inner function
          });
          //end of if statement
        }
        else if(req.url.indexOf("add_data?") >= 0)
        {
          var kvs = getFormValuesFromURL( req.url );
          var db = new sql.Database( 'weather.sqlite' );
          res.writeHead(200);
          var values = "('";
          var validTimeStringPattern = kvs['timeString'].match(/[\s01]?\d%3A[0-6]\d\+[PA]M/);
          //console.log(kvs['timeString']);
          if(!validTimeStringPattern || (parseInt(validTimeStringPattern[0].charAt(0) , 10) == 1 && parseInt(validTimeStringPattern[0].charAt(1) , 10) > 2) )
          {
            res.end("<div>Failed to add data! Time must be in format HH:MM PM " +
            "or HH:MM AM [where HH is less than 12]</div><br><form action='/go_back'>" +
            "<input type='submit' value='Go back'></input></form>");
          }
          else
          {
            var newTimeString = "";
            newTimeString += validTimeStringPattern[0].substring(0, validTimeStringPattern[0].indexOf('%'));
            newTimeString += ":" + validTimeStringPattern[0].substring(validTimeStringPattern[0].indexOf('%')+3, validTimeStringPattern[0].indexOf('%')+5);
            newTimeString += " " + validTimeStringPattern[0].substring(validTimeStringPattern[0].indexOf('M')-1, validTimeStringPattern[0].indexOf('M')+1);
            console.log("New time string: " + newTimeString)
            values += /*kvs['timeString']*/ newTimeString + "', ";
            values += parseFloat(kvs['temp']) + ", ";
            values += parseFloat(kvs['dewPoint']) + ", ";
            values += kvs['humidity'] + ", ";
            values += parseFloat(kvs['seaLevelPressure']) + ", ";
            values += kvs['visibility'] + ", '";
            values += kvs['windDirection'] + "', ";
            values += kvs['windSpeed'] + ", ";
            values += kvs['gustSpeed'] + ", ";
            values += kvs['precipitation'] + ", '";
            values += kvs['events'] + "', '";
            values += kvs['conditions'] + "', ";
            values += kvs['windDirectionDegrees']%360 + ", '";
            values += kvs['date'] + "')";
            console.log(values);
            db.run("INSERT INTO Weather VALUES " + values, function (err) {
              var finalString = "<div>";
              if(err)
              {
                finalString += "Failed to add data! " + err;
              }
              else
              {
                finalString += "Added data!";
              }
              finalString+="</div><br><form action='/go_back'><input type='submit' " +
              "value='Go back'></input></form>";
              res.end(finalString);
              //end of function
            });
            //end of else statement
          }
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
