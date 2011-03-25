Node SMTP Server
================

Usage
-----

1.  Replace `ip` and `name` with your own.
2.  `node smtp`
3.  Send an email to test@`ip`

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

