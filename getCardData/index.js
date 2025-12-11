"use strict";

const leankitApiFactory = require( "../leankit/api" );
const { getInputParams, setOutput, reportError, validateLeankitUrl } = require( "../leankit/helpers" );

( async () => {
	const [
		host,
		apiToken,
		cardId
	] = getInputParams( {
		required: [ "host", "apiToken", "cardId" ]
	} );

	validateLeankitUrl( "host", host );

	const { getCard } = leankitApiFactory( host, apiToken );

	const cardData = await getCard( cardId );

	setOutput( "cardData", JSON.stringify( cardData ) );
} )().catch( ex => {
	reportError( "getCardData", ex );
} );
