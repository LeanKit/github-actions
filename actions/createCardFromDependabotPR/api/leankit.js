"use strict";

const { get, post } = require( "got" );

module.exports = ( _baseUrl, _apiToken ) => {
	const baseUrl = _baseUrl;
	const Authorization = `Bearer ${ _apiToken }`;


	return {
		createCard: async card => {
			const { id } = await post( `${ baseUrl }/io/card`, {
				json: card,
				headers: {
					Authorization
				}
			} );
			return id;
		},
		getBoard: id => {
			return get( `${ baseUrl }/io/board/${ id }`, {
				headers: { Authorization }
			} ).json();
		}
	};
};
