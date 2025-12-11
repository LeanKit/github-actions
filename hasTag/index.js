"use strict";

const { setOutput } = require( "@actions/core" );
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

	const { getCard } = leankitApiFactory( host, apiToken );

	const { tags } = await getCard( cardId );

	setOutput( "tags", tags );

	const tagLower = tag.toLowerCase();
	const hasTag = tags.some( t => t.toLowerCase() === tagLower );

	setOutput( "hasTag", hasTag );
} )().catch( ex => {
	reportError( "hasTag", ex );
} );
