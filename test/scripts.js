var assert = require( 'assert' )
var fs = require( 'fs' )
var path = require( 'path' )
var glob = require( 'glob' )
var acorn = require( 'acorn' )
var astravel = require( 'astravel' )
var astring
try {
  astring = require( '../dist/astring.debug' )
  console.log( 'Using ./dist/astring.debug.js' )
} catch ( error ) {
  astring = require( '../dist/astring.min' )
  console.log( 'Using ./dist/astring.min.js' )
}


describe( 'Scripts tree comparison', function() {
  var pattern = path.join( __dirname, '../node_modules/{watchify,uglify-js,astravel,escodegen,babelify,acorn,minifyify,mocha,esotope,browserify,glob,benchmark}/**/*.js' )
  var options = {
    ecmaVersion: 6,
    sourceType: 'module',
    allowHashBang: true
  }

  var stripLocation = astravel.makeTraveler( {
     go: function( node, state ) {
        delete node.start;
        delete node.end;
        this[node.type]( node, state );
     }
  } );

  console.log( 'Looking for files…' )
  var files = glob.sync( pattern, {
    nodir: true
  } )
  console.log( 'Found', files.length, 'files' )
  var length = path.join( __dirname, '../node_modules/' ).length;
  files.forEach( function( filename ) {
    var code = fs.readFileSync( filename, 'utf8' )
    try {
      var ast = acorn.parse( code, options )
      stripLocation.go( ast )
      // console.log( JSON.stringify(ast, null, 2) )
    } catch ( error ) {
      return
    }
    it( filename.substr( length ), function() {
      var formattedAst = acorn.parse( astring( ast ), options )
      stripLocation.go( formattedAst )
      assert.deepEqual( formattedAst, ast )
    } )
  } )
} )