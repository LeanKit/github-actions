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

	const { initiateBoardEvent } = leankitApiFactory( host, apiToken );

	await initiateBoardEvent( boardId, eventName );
} )().catch( ex => {
	reportError( "initiateBoardEvent", ex );
} );
