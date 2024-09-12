"use strict";
const leankitApiFactory = require( "../leankit/api" );
const { getInputParams, reportError, validateLeankitUrl } = require( "../leankit/helpers" );

( async () => {
	const [
		host,
		apiToken,
		boardId,
		cardId,
		eventName
	] = getInputParams( { required: [ "host", "apiToken", "boardId", "cardId", "eventName" ] } );

	validateLeankitUrl( "host", host );

	const { triggerEvent } = leankitApiFactory( host, apiToken );

	await triggerEvent( boardId, cardId, eventName );
} )().catch( ex => {
	reportError( "createCard", ex );
} );
