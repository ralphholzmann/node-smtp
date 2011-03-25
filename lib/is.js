var toString = ({}).toString;

'Object String Array Function'.split(' ').forEach(function( type ) {
  exports[ type.toLowerCase() ] = function( obj ) {
    return toString.call( obj ) == "[object " + type + "]";
  };
});