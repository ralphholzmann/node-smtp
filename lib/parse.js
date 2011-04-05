var is        = require( './is.js' ),
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

function parseEmail( rawEmail ) {

  var email = {
    attachments : []
  };
  parsePart( rawEmail, email );
  return email;

}
// As the structure of email parts is the same as the raw email itself,
// we can use this function recursively to parse a raw email
function parsePart( rawPart, email ) {

  var part   = {},
      parts, headers, rest, boundary;
      
  // Split content at first double new line
  parts   = rawPart.split( nlnl );
  
  // If there are different parts ...
  if ( parts.length > 1 ) {
  
    // Try to parse headers
    headers = parseHeaders( parts[0] );

    // If headers exist
    if ( headers ) {
    
      // Assign them to the part
      if ( ! email.headers ) {
        email.headers = headers;
      }
      part.headers = headers;
      
      // Reconstruct the rest of the part
      rest = parts.slice(1).join(nlnl);

      
      // If a boundary exists, there's sections, recurse
      if ( part.headers.contentType && part.headers.contentType.boundary ) {
      
        part.parts = rest.trim().split( new RegExp( "(?:\r\n)?(?:--)?" + part.headers.contentType.boundary + "(?:--)?(?:\r\n)?" )).map( trim ).filter( exists ).forEach(function( v, i ){

          parsePart( v, email );
        
        });
      
      // Otherwise the rest is the content
      } else {
        part.body = rest;

        if ( part.headers.contentDisposition ) {
          email.attachments.push( part );
        } else {

          if ( part.headers.contentType.contentType == 'text/plain' ) {
            email.text = part; 
          } else if ( part.headers.contentType.contentType == 'text/html' ) {
            email.html = part;
          }

        }
      }
    }
  }

  return rawPart;

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
