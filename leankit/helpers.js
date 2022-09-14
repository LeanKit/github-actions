"use strict";

const { getInput, getBooleanInput, setFailed, setOutput, exportVariable } = require( "@actions/core" );

module.exports = {
	getInputParams( { required = [], optional = [], asBoolean = [] } ) {
		const values = [];
		for ( const param of required ) {
			const getInputFn = asBoolean.includes( param ) ? getBooleanInput : getInput;
			values.push( getInputFn( param, { required: true } ) );
		}

		for ( const param of optional ) {
			const getInputFn = asBoolean.includes( param ) ? getBooleanInput : getInput;
			values.push( getInputFn( param ) );
		}

		return values;
	},
	reportError( actionName, message ) {
		const msg = `${ actionName } error: ${ message }`;
		setOutput( "error", msg );
		exportVariable( "LK_ERROR_MESSAGE", msg );
		setFailed( msg );
	},
	validateLeankitUrl( name, value ) {
		const valid = /^https:\/\/.+\.(leankit\.com|leankit\.io|localkanban\.com)\/?$/i.test( value );
		if ( !valid ) {
			throw new Error( `Expected a leankit url for '${ name }' action parameter` );
		}
	}

};
