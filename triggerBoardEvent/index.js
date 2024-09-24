"use strict";
const leankitApiFactory = require( "../leankit/api" );
const { getInputParams, reportError, validateLeankitUrl } = require( "../leankit/helpers" );

( async () => {
	const [
		host,
		apiToken,
		boardId,
		eventName
	] = getInputParams( { required: [ "host", "apiToken", "boardId", "eventName" ] } );

	validateLeankitUrl( "host", host );

	const { triggerBoardEvent } = leankitApiFactory( host, apiToken );

	await triggerBoardEvent( boardId, eventName );
} )().catch( ex => {
	reportError( "createCard", ex );
} );
