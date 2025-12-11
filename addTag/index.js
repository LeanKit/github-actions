"use strict";

const leankitApiFactory = require( "../leankit/api" );
const { getInputParams, reportError, validateLeankitUrl } = require( "../leankit/helpers" );

( async () => {
	const [
		host,
		apiToken,
		cardId,
		tag
	] = getInputParams( {
		required: [ "host", "apiToken", "cardId", "tag" ]
	} );

	validateLeankitUrl( "host", host );

	const { addTag } = leankitApiFactory( host, apiToken );

	await addTag( cardId, tag );
} )().catch( ex => {
	reportError( "addTag", ex );
} );
