var fs = require( 'fs' );

if( process.argv.length < 4 )
{
    console.log( "Error: Two file paths required" );
    process.exit( 1 );
}

var fn1 = process.argv[ 2 ];
var fn2 = process.argv[ 3 ];

try
{
    var lines1 = fs.readFileSync( fn1 ).toString().split( "\n" );
    var lines2 = fs.readFileSync( fn2 ).toString().split( "\n" );
}
catch( e )
{
    console.log(
        "Error: Something bad happened trying to open "+
            fn1+" and "+fn2 );
    process.exit( 1 );
}

/* Fill in alignment penalties for the whole grid */
var data = [];
for( var i = 0; i < lines1.length + 1; i++ )
{
    var row = [];
    data.push( row );
    for( var j = 0; j < lines2.length + 1; j++ )
    {
        var cell = { best_align: false };
        row.push( cell );
        if( i == 0 )
        {
            cell.penalty = j;
        }
        else if( j == 0 )
        {
            cell.penalty = i;
        }
        else
        {
            var left = data[ i ][ j - 1 ].penalty;
            var up   = data[ i - 1 ][ j ].penalty;
            var left_up = 1 + Math.min( left, up );
            if( lines1[ i - 1 ] == lines2[ j - 1 ] )
            {
                cell.penalty = Math.min( left_up,
                                         data[ i - 1 ][ j - 1 ].penalty );
            }
            else
            {
                cell.penalty = left_up;
            }
        }
    }
}

/* Traceback */
var i = lines1.length;
var j = lines2.length;
data[ i ][ j ].best_align = true;
while( i > 0 || j > 0 )
{
    if( i == 0 )
    {
        j--;
    }
    else if( j == 0 )
    {
        i--;
    }
    else if( lines1[ i - 1 ] == lines2[ j - 1 ] )
    {
        i--;
        j--;
    }
    else if( data[ i ][ j - 1 ].penalty < data[ i - 1 ][ j ].penalty )
    {
        j--;
    }
    else if( data[ i ][ j - 1 ].penalty > data[ i - 1 ][ j ].penalty )
    {
        i--;
    }
    else
    {
        i--;
    }
    data[ i ][ j ].best_align = true;
}

/* Follow the bread crumbs */
for( var i = 0; i < data.length - 1; i++ )
{
    //row = data[i];
    for( var j = 0; j < row.length - 1; j++ )
    {
        if(data[i][j].best_align && data[i][j+1].best_align)
        {
          console.log("-", lines2[j]);
        }
        if(data[i][j].best_align && data[i+1][j].best_align)
        {
          console.log("+", lines1[i]);
        }

        // if( row[j].best_align )
        // {
        //     process.stdout.write( "*" );
        // }
        // else
        // {
        //     process.stdout.write( "-" );
        // }
    }
    //console.log( "" );
}
