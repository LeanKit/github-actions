"use strict";

const { getInputParams, setOutput, reportError } = require( "../leankit/helpers" );

( async () => {
	const [ inputText ] = getInputParams( { required: [ "inputText" ] } );

	// supports (LK:12345), (card 12345), (whatever: 12345) or even (12345) formats
	const matches = inputText.match( /\((?:[A-z]+:?)? ?([0-9]*)\)/ );

	if ( matches ) {
		setOutput( "cardId", matches[ 1 ] );
	}
} )().catch( ex => {
	reportError( "extractCardId", ex.message );
} );
