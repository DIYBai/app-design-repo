var jsc = require( 'jsverify' );

console.log( "Running the Boolean test:" );
// forall (f: json -> bool, b: bool), f (f (f b)) ≡ f(b).
var boolFnAppliedThrice =
    jsc.forall( "bool -> bool", "bool",
        function( f, b )
        {
            return f( f( f( b ) ) ) === f( b );
        }
    );
jsc.assert( boolFnAppliedThrice );
console.log( "... OK, passed 100 tests" );

function arraysEqual( a1, a2 )
{
    try {
        if( a1.length !== a2.length )
            return false;
        for( var i = 0; i < a1.length; i++ )
        {
            if( a1[i] !== a2[i] )
                return false;
        }
        return true;
    }
    catch( exp ) {
        return false;
    }
}

console.log( "Running the sort idempotent test:" );
// forall (f: string -> nat, arr: array string),
// sortBy(sortBy(arr, f), f) ≡ sortBy(arr, f).
var sortIdempotent =
    jsc.forall( "array string",
        function( arr )
        {
            var arr_copy = arr.slice();
            arr.sort();
            arr_copy.sort().sort()
            return arraysEqual( arr, arr_copy );
    } );
jsc.assert( sortIdempotent );
console.log( "... OK, passed 100 tests" );


console.log( "Running the lengths equal test:" );
console.log( "Write a test that returns true if sorting doesn't change an array's length" );
var sortLength =
    jsc.forall( "array string",
        function( arr )
        {
            var arr_sorted = arr.sort();
            return (arr.length == arr_sorted.length);
        } );
jsc.assert( sortLength );
console.log( "... OK, passed 100 tests" );


console.log( "Running the in-order test:" );
console.log( "Write a test that returns true the elements of the sorted array are in order" );
var sortInOrder =
    jsc.forall( "array string",
        function( arr )
        {
            var arr_sorted = arr.sort();
            try {
              for(var i = 0; i < arr_sorted.length-1; i++)
              {
                if(arr_sorted[i] > arr_sorted[i+1])
                {
                  return false;
                }
              }
            }
            catch(exp){}
            return true;
        } );
jsc.assert( sortInOrder );
console.log( "... OK, passed 100 tests" );


console.log( "Running the add/remove test:" );
console.log( "Write a test that returns true if every element that appears somewhere in the sorted array appears somewhere in the unsorted array and vice-versa" );
var sortAddRemove =
    jsc.forall( "array string", "nat",
        function( arr, idx)
        {
            idx = idx%arr.length;
            var arr_sorted = arr.sort();
            if(arr.length == 0)
            {
              return true;
            }
            for(var i = 0; i < arr_sorted.length; i++)
            {
              if (arr[idx] === arr_sorted[i])
              {
                return true;
              }
            }
            return false;
        } );
jsc.assert( sortAddRemove );
console.log( "... OK, passed 100 tests" );


console.log( "Running the sort number of copies test:" );
console.log( "Write a test that returns true if the number of copies of a particular value in the unsorted array is the same as the number of copies of that value in the sorted array." );
var sortNumCopies =
    jsc.forall( "array string", "nat",
        function( arr , idx)
        {
            idx = idx%arr.length;
            var arr_sorted = arr.sort();
            var value = arr[idx];
            var valueAmount = 0;
            var valueAmountSorted = 0;
            for(var i = 0; i < arr.length; i++)
            {
              if (arr[i] === value)
              {
                valueAmount++;
              }
              if(arr_sorted[i] === value)
              {
                valueAmountSorted++;
              }
            }
            return(valueAmount === valueAmountSorted);
        } );
jsc.assert( sortNumCopies );
console.log( "... OK, passed 100 tests" );
