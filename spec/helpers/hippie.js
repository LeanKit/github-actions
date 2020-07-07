const hippie = require( "hippie" );

hippie.prototype.basicAuth = function( username, password ) {
	const encoded = new Buffer( `${ username }:${ password }` ).toString( "base64" );
	return this.header( "Authorization", `Basic ${ encoded }` );
};

hippie.prototype.deviceTokenAuth = function( token ) {
	return this.header( "Authorization", `Token ${ token }` );
};

hippie.prototype.tokenAuth = function( token ) {
	return this.header( "Authorization", `Bearer ${ token }` );
};

hippie.prototype.cookieAuth = function( cookie ) {
	return this.header( "Cookie", `.ASPXAUTH=${ cookie }` );
};

hippie.prototype.jwtAuth = function( token ) {
	return this.header( "Authorization", `JWT ${ token }` );
};

hippie.prototype.expectBodyPartial = function( partial ) {
	this.expect( ( res, body, next ) => {
		body.should.partiallyEql( partial );
		next();
	} );
	return this;
};

hippie.prototype.then = function( resolving, rejecting ) {
	return new Promise( ( resolve, reject ) => {
		this.end( ( err, resp, body ) => {
			if ( err ) {
				return reject( err );
			}
			return resolve( body );
		} );
	} ).then( resolving, rejecting );
};

module.exports = hippie;
