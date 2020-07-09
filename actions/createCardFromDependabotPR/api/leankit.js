"use strict";

const { post } = require( "got" );

module.exports = ( _baseUrl, _apiToken ) => {
	const baseUrl = _baseUrl;
	const Authorization = `Bearer ${ _apiToken }`;


	return {
		createCard: async card => {
			console.log( `create card '${ card.title }' in lane '${ card.laneId }` );
			const { id } = await post( `${ baseUrl }/io/card`, {
				json: card,
				headers: {
					Authorization
				}
			} );
			return id;
		},
		getBoard: id => {
			console.log( `get board id '${ id }'` );
		}
	};
};
