"use strict";
const leankitApiFactory = require( "../leankit/api" );
const { getInputParams, reportError, validateLeankitUrl } = require( "../leankit/helpers" );

( async () => {
	const [
		host,
		apiToken,
		boardId,
		eventName,
		cardId
	] = getInputParams( { required: [ "host", "apiToken", "boardId", "eventName" ], optional: [ "cardId" ] } );

	validateLeankitUrl( "host", host );

	const { triggerEvent } = leankitApiFactory( host, apiToken );

	await triggerEvent( boardId, eventName, cardId );
} )().catch( ex => {
	reportError( "createCard", ex );
} );
