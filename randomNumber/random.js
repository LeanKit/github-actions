const core = require( "@actions/core" );
const github = require( "@actions/github" );

try {
  // `who-to-greet` input defined in action metadata file
  const minValue = Number( core.getInput( "min-val" ) );
  const maxValue = Number( core.getInput( "max-val" ) );
  console.log( "minValue:", minValue );
  console.log( "maxValue:", maxValue );
  
  const rando = Math.floor( Math.random() * (maxValue - minValue + 1) + minValue );
  console.log( "rando:", rando );
  core.setOutput( "random", rando );
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}