var net         = require( 'net' ),
    fs          = require( 'fs' ),
    ip          = '74.207.234.151',
    name        = 'Send to Dropbox',
    port        = 25,
    smtp = (function( ip, name ) {

      var eol       = "\r\n",
          commands  = {
            'OPEN' : '220 ' + ip + ' ESMTP ' + name,  
            'EHLO' : [
              '250-' + ip + ' OH HAI <var>',
              '250-SIZE 35651584',
              '250-PIPELINING',
              '250-ENHANCEDSTATUSCODES',
              '250 8BITMIME'
            ].join( eol ),
            'HELO' : '250 OH HAI <var>',
            'MAIL' : '250 Ok',
            'RCPT' : '250 Ok',
            'DATA' : '354 End data with <CR><LF>.<CR><LF>',
            '.'    : '250 OK id=1778te-0009TT-00',
            'QUIT' : '221 Peace Out'
          };
     
      function sendResponse( socket, command, arg ) {
    
        var response = commands[ command ];
    
        if ( arg ) {
          response = response.replace( '<var>', arg );
        }
        console.log( 'S: ' + response );
        socket.write( response + eol );
    
      };
    
      return {
        sendResponse  : sendResponse,
        commands      : commands
      };
    
    })( ip ),
    server      = function( socket ) {

      var email = "",
          timeout;

      // Set encoding
      socket.setEncoding( 'utf8' );

      // New Connections
      socket.addListener( 'connect', function() {
        console.log( 'Incoming email!\n' );
        smtp.sendResponse( socket, 'OPEN' );
      });

      // Incoming Data
      socket.addListener( 'data', function( data ) {

        var parts   = data.split(/\s|\\r|\\n/),
            command = parts[0];

        console.log('C: ' + parts.join(' ').trim());

        // Check for a command
        if ( smtp.commands[ command ] ) {
          smtp.sendResponse( socket, command, parts[1] );
        // Check for end of email
        } else if ( data.substr(-5) == "\r\n.\r\n" ) {
          email += data.substring(0, data.length - 5); 
          smtp.sendResponse( socket, '.' );
        // Build email
        } else {
          email += data;
        }

        clearTimeout( timeout );
        timeout = setTimeout(function(){
          smtp.sendResponse(socket, 'MAIL'); 
        }, 10000);
      });

      // Finished
      socket.addListener( 'close', function() {
        clearTimeout( timeout );

        // Do something with the email here
      });

    },
    smtpServer  = net.createServer( server );

console.log( 'Starting email server' );
// SMTP Convo will log to console.
// C: are client commands
// S: are server commands.

smtpServer.listen( port, ip );
