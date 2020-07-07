const chai = require( "chai" );
const dirtyChai = require( "dirty-chai" );
const chaiAsPromised = require( "chai-as-promised" );
const sinonChai = require( "sinon-chai" );

chai.use( chaiAsPromised );
chai.use( dirtyChai );
chai.use( sinonChai );

function deepCompare( a, b, k ) {
	let diffs = [];
	if ( b === undefined ) {
		diffs.push( `expected ${ k } to equal ${ a } but was undefined` );
	} else if ( Array.isArray( a ) ) {
		a.forEach( c => {
			const key = k ? [ k, c ].join( "." ) : c;
			diffs = diffs.concat( deepCompare( a[ c ], b[ c ], key ) );
		} );
	} else if ( typeof a === "object" && a !== null ) {
		Object.keys( a ).forEach( c => {
			const key = k ? [ k, c ].join( "." ) : c;
			diffs = diffs.concat( deepCompare( a[ c ], b[ c ], key ) );
		} );
	} else {
		const equal = ( a == b ); // eslint-disable-line eqeqeq
		if ( !equal ) {
			diffs.push( `expected ${ k } to equal ${ a } but got ${ b }` );
		}
	}
	return diffs;
}

const Assertion = chai.Assertion;
const assert = chai.assert;

Assertion.addMethod( "partiallyEql", function( partial ) {
	const self = this; // eslint-disable-line no-invalid-this
	const obj = self._obj;

	function doAssert( actual ) {
		const diffs = deepCompare( partial, actual );
		return self.assert(
			diffs.length === 0,
			diffs.join( "\n\t" )
		);
	}

	if ( !obj.then ) {
		return doAssert( obj );
	}
	return obj.then( doAssert );
} );

assert.partiallyEql = ( obj, value ) => {
	return new Assertion( obj ).to.be.partiallyEql( value );
};

module.exports = {
	should: chai.should(),
	chai
};
