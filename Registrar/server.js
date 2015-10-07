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
    return kvs
}

function server_fun( req, res )
{
    //console.log( "The URL: '", req.url, "'" );
    // ...
    if( req.url === "/" || req.url === "/index.htm" )
    {
        req.url = "/index.html";
    }
    var filename = "./" + req.url;
    try {
        var contents = fs.readFileSync( filename ).toString();
        res.writeHead( 200 );
        res.end( contents );
    }
    catch( exp ) {
        if( req.url.indexOf( "add_student?" ) >= 0 )
        {
            addThing( req, res, "Students", "student" );
        }
        else if( req.url.indexOf( "add_teacher?" ) >= 0 )
        {
            addThing( req, res, "Teachers", "teacher" );
        }
        else if( req.url.indexOf( "add_class?" ) >= 0 )
        {
            addThing( req, res, "Classes", "class" );
        }
        else if( req.url.indexOf( "add_assignment?" ) >= 0 )
        {
            addThing( req, res, "Assignments", "assignment" );
        }
        else if( req.url.indexOf( "add_enrollment?" ) >= 0 )
        {
            addThing( req, res, "Enrollments", "enrollment" );
        }

        else if(req.url.indexOf("see_students.html") >= 0)
        {
            showThing(req, res, "Students");
        }
        else if(req.url.indexOf("see_teachers.html") >= 0)
        {
            showThing(req, res, "Teachers");
        }
        else if(req.url.indexOf("see_classes.html") >= 0)
        {
            showThing(req, res, "Classes");
        }
        else if(req.url.indexOf("see_assignments.html") >= 0)
        {
            showRelationalThing(req, res, "Assignments");
        }
        else if(req.url.indexOf("see_enrollments.html") >= 0)
        {
            showRelationalThing(req, res, "Enrollments");
        }
        else
        {
            // console.log( exp );
            res.writeHead( 404 );
            res.end( "Cannot find file: "+filename );
        }
    }
}

function addThing( req, res, addingType, typeName )
{
    var inputs = req.url.split('?')[1].split('&');
    var db = new sql.Database( 'registrar.sqlite' );
    var input1 = inputs[0].split('=')[1];
    var tempArray = input1.split('+');
    if(tempArray.length > 1)
    {
      input1 = tempArray[0];
      for(var i = 1; i < tempArray.length; i++)
      {
        input1 += " " + tempArray[i];
      }
    }
    console.log(input1);
    var input2 = inputs[1].split('=')[1];
    tempArray = input2.split('+');
    if(tempArray.length > 1)
    {
      input2 = tempArray[0];
      for(var i = 1; i < tempArray.length; i++)
      {
        input2 += " " + tempArray[i];
      }
    }
    console.log(input2);

    db.run( "INSERT INTO " + addingType + " VALUES ( ?, ? )", input1, input2,
            function( err ) {
                if( err === null )
                {
                    res.writeHead( 200 );
                    res.end( "Added " + typeName + "." );
                }
                else
                {
                    console.log( err );
                    res.writeHead( 200 );
                    res.end( "FAILED\n" + err );
                }
            } );
}

function showThing(req, res, showingType)
{
  var db = new sql.Database( 'registrar.sqlite' );
  res.writeHead(200);
  var res_string = "<table><tr style='font-weight:bold'><td>ID</td><td> | Item</td></tr>"
  db.all( 'SELECT * FROM ' + showingType + '',
      function( err, rows ) {
          if( err !== null )
          {
              console.log( err );
              res.end("ERROR: " + err);
              return;
          }
          for( var i = 0; i < rows.length; i++ )
          {
              res_string += "<tr><td>"
              if(showingType == "Students")
              {
                  res_string += rows[i].sid;
              }
              else if(showingType == "Teachers")
              {
                  res_string += rows[i].tid;
              }
              else if(showingType == "Classes")
              {
                  res_string += rows[i].cid;
              }
              res_string += "</td><td> | " + rows[i].Name + "<td></tr>"
          }
          res_string += "</table>"
          res.end(res_string);
      } );
}

function showRelationalThing(req, res, showingType)
{

  var db = new sql.Database( 'registrar.sqlite' );
  res.writeHead(200);
  var access_field_string = "Students on Students.sid = Enrollments.student";
  if(showingType == "Assignments")
  {
    access_field_string = "Teachers on Teachers.tid = Assignments.teacher";
  }
  var res_string = "<table><tr style='font-weight:bold'><td>Person</td><td> | Class</td></tr>"
  db.all( 'SELECT Classes.Name as ClassName, * FROM ' + showingType +
            ' JOIN Classes on Classes.cid = ' + showingType + '.class' +
            ' JOIN ' + access_field_string,
      function( err, rows ) {
          if( err !== null )
          {
              console.log( err );
              res.end("ERROR: " + err);
              return;
          }
          for( var i = 0; i < rows.length; i++ )
          {
              //console.log(rows[i]);
              res_string += "<tr><td>" + rows[i].Name + "</td><td> | " + rows[i].ClassName + "<td></tr>"
          }
          res_string += "</table>";
          res.end(res_string);
      } );
}


var server = http.createServer( server_fun );

server.listen( 8080 );
