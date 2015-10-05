
var fs = require( 'fs' );
var sql = require( 'sqlite3' );//.verbose();

var db = new sql.Database('weather.sqlite');
// var lines = fs.readFileSync("weather_data.csv").toString().split('\n');
// var lines = fs.readFileSync("weather_data.csv").toString().split('\r');
var lines = fs.readFileSync("weather_data.csv").toString().split('\r\n');
for(var i = 1; i < lines.length; i++)
{
	var line_contents = lines[i].split(',', 14);
	var values = "(";
	for(var j = 0; j < line_contents.length-1; j++)
	{
		if(j == 0 || j == 6 || j == 7 || j == 9 || j == 10 || j == 11)
		{
			values +="'" + line_contents[j] + "'";
		}
		else
		{
			values += line_contents[j];
		}
		values += ",";
	}
	var lastValue = line_contents[line_contents.length-1];
	lastValue = "'" + lastValue + "')";
	values += lastValue;
	// console.log(values)
	db.run("INSERT INTO Weather VALUES " + values, function (err) {
		//console.log(err);
	});
}
