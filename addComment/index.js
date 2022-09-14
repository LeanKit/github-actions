"use strict";

const leankitApiFactory = require( "../leankit/api" );
const { getInputParams, reportError, validateLeankitUrl } = require( "../leankit/helpers" );

( async () => {
	const [
		host,
		apiToken,
		cardId,
		comment
	] = getInputParams( { required: [ "host", "apiToken", "cardId", "comment" ] } );

	validateLeankitUrl( "host", host );

	const { addComment } = leankitApiFactory( host, apiToken );

	await addComment( cardId, comment );
} )().catch( ex => {
	reportError( "addComment", ex.message );
} );
