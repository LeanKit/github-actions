"use strict";

const { getInput, setOutput, setFailed } = require( "@actions/core" );
const leankitApiFactory = require( "../leankit" );

function validateParams( requiredParams = [], optionalParams = [] ) {
	const values = {
		required: [],
		optional: []
	};
	for ( const param of requiredParams ) {
		const value = getInput( param );
		if ( !value ) {
			throw new Error( `Expected '${ param }' action parameter` );
		}
		values.required.push( value );
	}

	for ( const param of optionalParams ) {
		const value = getInput( param );
		values.optional.push( value || null );
	}

	return values;
}

( async () => {
	const {
		required: [
			host,
			apiToken,
			boardId,
			title
		],
		optional: [
			laneId,
			typeId
		]
	} = validateParams( [ "host", "api-token", "board-id", "title" ], [ "lane-id", "type-id" ] );

	const { createCard } = leankitApiFactory( host, apiToken );

	const id = await createCard( {
		boardId,
		title,
		laneId,
		typeId
	} );

	setOutput( "created-card-id", id );
} )().catch( ex => {
	setFailed( ex.message );
} );
