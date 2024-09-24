"use strict";
const leankitApiFactory = require( "../leankit/api" );
const { getInputParams, reportError, validateLeankitUrl } = require( "../leankit/helpers" );

( async () => {
	const [
		host,
		apiToken,
		cardId,
		eventName
	] = getInputParams( { required: [ "host", "apiToken", "cardId", "eventName" ] } );

	validateLeankitUrl( "host", host );

	const { triggerCardEvent } = leankitApiFactory( host, apiToken );

	await triggerCardEvent( cardId, eventName );
} )().catch( ex => {
	reportError( "createCard", ex );
} );
