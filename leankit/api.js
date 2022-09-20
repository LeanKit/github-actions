"use strict";

const got = require( "got" );

module.exports = ( _baseUrl, apiToken ) => {
	const Authorization = `Bearer ${ apiToken }`;
	const baseUrl = _baseUrl.endsWith( "/" ) ? _baseUrl.substr( 0, _baseUrl.lastIndexOf( "/" ) ) : _baseUrl;

	const api = {
		getCard: cardId => {
			return got( `${ baseUrl }/io/card/${ cardId }`, {
				method: "GET",
				headers: { Authorization }
			} ).json();
		},
		blockCard: ( cardId, isBlocked, blockReason ) => {
			return got( `${ baseUrl }/io/card/${ cardId }`, {
				method: "PATCH",
				json: [
					{ op: "replace", path: "/blockReason", value: blockReason },
					{ op: "replace", path: "/isBlocked", value: isBlocked }
				],
				headers: { Authorization }
			} ).json();
		},
		moveCard: ( cardId, laneId, wipOverrideComment ) => {
			return got( `${ baseUrl }/io/card/move`, {
				method: "POST",
				json: {
					cardIds: [ cardId ],
					destination: {
						laneId
					},
					wipOverrideComment
				},
				headers: { Authorization }
			} ).json();
		},
		addComment: ( cardId, comment ) => {
			return got( `${ baseUrl }/io/card/${ cardId }/comment`, {
				method: "POST",
				json: {
					text: comment
				},
				headers: { Authorization }
			} ).json();
		},
		createCard: async card => {
			const { id } = await got( `${ baseUrl }/io/card`, {
				method: "POST",
				json: card,
				headers: { Authorization }
			} ).json();
			return id;
		},
		async verifyCardPosition( cardId, laneId ) {
			const card = await api.getCard( cardId );
			return card.lane.id === laneId;
		}
	};

	return api;
};
