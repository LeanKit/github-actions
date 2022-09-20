const chai = require( "./chai" );
const should = chai.should;
const sinon = require( "sinon" );
const path = require( "path" );
const proxyquire = require( "proxyquire" );

const proxy = proxyquire.noPreserveCache().noCallThru();

const ROOT_PATH = path.join( __dirname, "../../" );
const getPathFromRoot = function( filePath ) {
	return path.resolve( ROOT_PATH, filePath );
};
const requireFromRoot = function( modulePath ) {
	return require( getPathFromRoot( modulePath ) ); // eslint-disable-line
};

global.testHelpers = {
	chai,
	should,
	sinon,
	proxyquire( module, ...args ) {
		// Add some sugar to allow us to proxyquire from the root of the app
		if ( module.startsWith( "~" ) ) {
			module = path.join( ROOT_PATH, module.substr( 1 ) );
		}
		return proxy( module, ...args );
	},
	requireFromRoot
};

module.exports = testHelpers;
