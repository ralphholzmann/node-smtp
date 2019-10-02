Node SMTP Server
================

Usage
-----

1.  Replace `IP` and `NAME` with your own.
1.  Perform a reverse-lookup of your IP, and store the value in `PRR`
1.  Provide domains you will accept mails from in `DOMAIN`. Any other domains provided will be rejected, closing a potential Open Relay exploit.
1.  `node smtp.js` (you may have to `sudo`)
1.  Send an email to test@`ip`, or to the domain resolved by your MX record.

Notice
------

Tested in node 0.4.2+. Likely will not work with 0.2.X.

This SMTP server is under development. Right now it only supports accepting emails into an `email` string. Support for outgoing emails, `Buffer`s, and TLS likely to come in the future.

Node Email Parser
=================

Usage
-----

    var parse = require( 'lib/parse.js' ),
        email = parse.email( rawEmail );

    console.log( email.headers.contentType );

Examples are provided in the `test` folder.
`node test-parse.js Gmail`
