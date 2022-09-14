"use strict";

const { setOutput, warning } = require( "@actions/core" );
const leankitApiFactory = require( "../leankit/api" );
const { getInputParams, reportError, validateLeankitUrl } = require( "../leankit/helpers" );

( async () => {
	const [
		host,
		apiToken,
		boardId,
		title,
		laneId,
		typeId
	] = getInputParams( { required: [ "host", "apiToken", "boardId", "title" ], optional: [ "laneId", "typeId" ] } );

	validateLeankitUrl( "host", host );

	const { createCard } = leankitApiFactory( host, apiToken );

	const payload = { boardId, title, laneId, typeId };

	const id = await createCard( payload );

	setOutput( "createdCardId", "21" );
} )().catch( ex => {
	warning( "createCard exception:", ex );
	reportError( "createCard", ex.message );
} );
