"use strict";

const { getInput, setOutput, setFailed } = require( "@actions/core" );
const leankitApiFactory = require( "../leankit" );

function validateParams( params ) {
	const values = [];
	for ( const param of params ) {
		const value = getInput( param );
		if ( !value ) {
			throw new Error( `Expected '${ param }' action parameter` );
		}
		values.push( value );
	}
	return values;
}

( async () => {
	const [
		apiToken,
		cardId,
		host,
		comment
	] = validateParams( [ "apiToken", "cardId", "host", "comment" ] );
	const { addComment } = leankitApiFactory( host, apiToken );

	await addComment( cardId, comment );
} )().catch( ex => {
	setOutput( "error-message", ex.message );
	setFailed( ex.message );
} );
