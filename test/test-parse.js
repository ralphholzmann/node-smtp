var fs    = require( 'fs' ),
    util  = require('util'),
    parse = require( '../lib/parse.js' );


fs.readFile( process.argv[2], 'utf-8', function( err, data ) {

  var email = parse.email( data );
  
  console.log( util.inspect( email, false, null ));

});
