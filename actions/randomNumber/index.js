"use strict";

const core = require( "@actions/core" );

try {
	const minValue = Number( core.getInput( "min-val" ) );
	const maxValue = Number( core.getInput( "max-val" ) );

	const rando = Math.floor( ( Math.random() * ( maxValue - minValue + 1 ) ) + minValue );
	core.setOutput( "random", rando );
} catch ( error ) {
	core.setFailed( error.message );
}
