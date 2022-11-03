"use strict";
const { setOutput } = require( "@actions/core" );
const leankitApiFactory = require( "../leankit/api" );
const { getInputParams, reportError, validateLeankitUrl } = require( "../leankit/helpers" );

( async () => {
	const [
		host,
		apiToken,
		boardId,
		title,
        customId,
        externalLink,
		laneId,
		typeId
	] = getInputParams( { required: [ "host", "apiToken", "boardId", "title" ], optional: [ "customId", "externalLink", "laneId", "typeId" ] } );

	validateLeankitUrl( "host", host );

	const { createCard } = leankitApiFactory( host, apiToken );

	const payload = { boardId, title };

	if ( laneId ) {
		payload.laneId = laneId;
	}
	if ( typeId ) {
		payload.typeId = typeId;
	}

    if ( customId ) {
		payload.customId = customId;
	}
    if ( externalLink ) {
		payload.externalLink = {
            url: customId,
            label: "Link to Github"
        };
	}


	const id = await createCard( payload );

	setOutput( "createdCardId", id );
} )().catch( ex => {
	reportError( "createCard", ex );
} );
