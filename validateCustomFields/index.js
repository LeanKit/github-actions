"use strict";

const { setOutput } = require( "@actions/core" );
const leankitApiFactory = require( "../leankit/api" );
const { getInputParams, reportError, validateLeankitUrl } = require( "../leankit/helpers" );


( async () => {
	const [
		host,
		apiToken,
		cardId,
		requiredCustomFields,
		providedCustomFields
	] = getInputParams( {
		required: [ "host", "apiToken", "cardId", "requiredCustomFields" ],
		optional: [
			"customFields"
		]
	} );

	validateLeankitUrl( "host", host );

	const { getCard } = leankitApiFactory( host, apiToken );

	let customFields;
	if ( providedCustomFields ) {
		customFields = JSON.parse( providedCustomFields );
	} else {
		( { customFields } = await getCard( cardId ) );
	}

	setOutput( "customFields", customFields );

	const customFieldsById = {};
	const customFieldsByLabel = {};

	customFields.forEach( ( { fieldId, label, value } ) => {
		if ( value !== null && value !== undefined && value !== "" ) {
			customFieldsById[ fieldId ] = value;
			customFieldsByLabel[ label.toLowerCase() ] = value;
		}
	} );

	setOutput( "customFieldsByLabel", customFieldsByLabel );
	setOutput( "customFieldsById", customFieldsById );

	const requiredItems = requiredCustomFields.split( /\s*,\s*/ ).map( f => f.trim() );
	const missingCustomFields = [];
	for ( const requiredItem of requiredItems ) {
		if ( !( requiredItem.toLowerCase() in customFieldsByLabel || requiredItem in customFieldsById ) ) {
			missingCustomFields.push( requiredItem );
		}
	}

	if ( missingCustomFields.length ) {
		throw new Error( `Card is missing required custom fields: ${ missingCustomFields.join( ", " ) }` );
	}
} )().catch( ex => {
	reportError( "validateCustomFields", ex.message );
} );
