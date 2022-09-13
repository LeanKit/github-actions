"use strict";

const { getInput, setFailed } = require( "@actions/core" );
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
		laneId,
		wipOverrideComment
	] = validateParams( [ "apiToken", "cardId", "host", "laneId", "wipOverrideComment" ] );

	const { moveCard } = leankitApiFactory( host, apiToken );

	await moveCard( cardId, laneId, wipOverrideComment );
} )().catch( ex => {
	setFailed( ex.message );
} );
