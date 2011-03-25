var is        = require( './lib/is.js' ),
    _         = require( 'underscore' ),
    exists    = function( i ) { return !! i },
    trim      = function( i ) { return String.prototype.trim.call( i ) }
    camelCase = (function(){
      var camel   = function( all, letter ) {
        return letter.toUpperCase();
      },
      rdashAlpha  = /-([a-z])/ig;
    
      return function( string ) {
        return string.toLowerCase().replace( rdashAlpha, camel ).trim();
      }
    })(),
    nl        = "\r\n",
    nlnl      = nl + nl;

// As the structure of email parts is the same as the raw email itself,
// we can use this function recursively to parse a raw emailß
function parseEmail( rawEmail ) {

  var email   = {},
      parts, headers, rest, boundary;
      
  // Split content at first double new line
  parts   = rawEmail.split( nlnl );
  
  // If there are different parts ...
  if ( parts.length > 1 ) {
  
    // Try to parse headers
    headers = parseHeaders( parts[0] );

    // If headers exist
    if ( headers ) {
    
      // Assign them to the email
      email.headers = headers;
      
      // Reconstruct the rest of the email
      rest = parts.slice(1).join(nlnl);


      
      // If a boundary exists, there's sections, recurse
      if ( email.headers.contentType && email.headers.contentType.boundary ) {
      
        email.parts = rest.trim().split( new RegExp( "(?:\r\n)?(?:--)?" + email.headers.contentType.boundary + "(?:--)?(?:\r\n)?" )).map( trim ).filter( exists ).map( parseEmail );
      
      // Otherwise the rest is the content
      } else {
        email.body = rest;
      }
      
      // Flatten email parts
      if ( email.parts ) {
        email.parts = email.parts.map(function( v, i ) {
          return v.parts ? v.parts : v;
        });
        email.parts = _.flatten( email.parts );
      }

      return email;

    }
  }

  return rawEmail;

}

function parseHeaders( rawHeaders ) {

  var headers = {}

  if ( ! /content-type:/gi.test( rawHeaders )) {
    return false;
  }

  rawHeaders.replace(/\r\n(?:\s{8}|\t)/gi, ' ').match(/(.*):\s(.*)(?:\r\n)?/gi).forEach(function( v ) {
    var parts = v.split(':'),
        key   = camelCase( parts.shift()),
        value = parts.join('').trim(),
        special, temp;
  
    if ( headers[ key ] ) {

      if ( is.array( headers[ key ] ) ) {
        headers[ key ].push( value )
      } else {
        temp = headers[ key ];
        headers[ key ] = [ temp, value ];
      }

    } else {
      headers[ key ] = value; 
    }
  
  });

  for ( var header in headers ) {
    (function(){
      var parts;
      
      if ( is.string( headers[ header ] ) ) {
      
        parts = headers[ header ].split(';');

        if ( parts.length > 1 ) {
        
          headers[ header ] = {};
          headers[ header ][ header ] = parts.shift();

          parts.forEach(function( v ){
          
            var parts = v.split('='),
                key   = camelCase( parts[0] ),
                value = parts[1],
                temp;

            headers[ header ][ key ] = value;

          }); 
        }
      }
    })( header );
  }

  // Special cases I like to cover
  if ( headers.contentType && headers.contentType.name ) {
    special = headers.contentType.name.replace(/^"|'/, '').replace(/"|'$/, '').split('.');
    headers.extension = special.pop();
    headers.filename = special.join('.') + '.' + headers.extension;
  }

  return headers;

}



exports.email   = parseEmail;
exports.headers = parseHeaders;