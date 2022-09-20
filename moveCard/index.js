"use strict";

const leankitApiFactory = require( "../leankit/api" );
const { getInputParams, reportError, validateLeankitUrl } = require( "../leankit/helpers" );

( async () => {
	const [
		host,
		apiToken,
		cardId,
		laneId,
		wipOverrideComment
	] = getInputParams( { required: [ "host", "apiToken", "cardId", "laneId" ], optional: [ "wipOverrideComment" ] } );

	validateLeankitUrl( "host", host );

	const { moveCard } = leankitApiFactory( host, apiToken );

	await moveCard( cardId, laneId, wipOverrideComment );
} )().catch( ex => {
	reportError( "moveCard", ex.message );
} );
