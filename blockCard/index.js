"use strict";

const leankitApiFactory = require( "../leankit/api" );
const { getInputParams, reportError, validateLeankitUrl } = require( "../leankit/helpers" );

( async () => {
	const [
		host,
		apiToken,
		cardId,
		isBlocked,
		blockReason
	] = getInputParams( {
		required: [ "host", "apiToken", "cardId", "isBlocked" ],
		optional: [ "blockReason" ],
		asBoolean: [ "isBlocked" ]
	} );

	validateLeankitUrl( "host", host );

	const { blockCard } = leankitApiFactory( host, apiToken );

	await blockCard( cardId, isBlocked, blockReason );
} )().catch( ex => {
	reportError( "blockCard", ex.message );
} );
