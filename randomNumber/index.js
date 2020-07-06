const core = require( "@actions/core" );
const github = require( "@actions/github" );
const { compact } = require("lodash");

try {
  // `who-to-greet` input defined in action metadata file
  const minValue = Number( core.getInput( "min-val" ) );
  const maxValue = Number( core.getInput( "max-val" ) );
  console.log( "minValue:", minValue );
  console.log( "maxValue:", maxValue );
  console.log( "core.getInput( 'repo-token' ):", core.getInput( 'repo-token' ) );
  
  const rando = Math.floor( Math.random() * (maxValue - minValue + 1) + minValue );
  console.log( "rando:", rando );
  core.setOutput( "random", rando );
  console.log( "Object.keys( github ):", Object.keys( github ) );
  console.log( "Object.keys( github.context ):", Object.keys( github.context ) );
} catch (error) {
  core.setFailed(error.message);
}