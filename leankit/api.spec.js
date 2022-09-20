"use strict";

const { sinon, proxyquire } = testHelpers;

describe( "leankit/api", () => {
	let factory, api, got;
	beforeEach( () => {
		const json = sinon.stub().returns( "CARD" );
		got = sinon.stub().returns({ json } );
		factory = proxyquire( "~leankit/api", {
			"got": got
		});
		got.json = json;
		api = factory( "BASEURL", "APITOKEN" );
	} );

	describe( "getCard", () => {
		let result;
		beforeEach( async () => {
			result = await api.getCard( "CARDID" );
		} );

		it( "should get /io/card with expected params", async () => {
			got.should.be.calledOnce.and.calledWith( "BASEURL/io/card/CARDID", {
				method: "GET",
				headers: {
					Authorization: "Bearer APITOKEN"
				}
			})
		} );

		it( "should use json", () => {
			got.json.should.be.calledOnce();
		} );

		it( "should return result", () => {
			result.should.equal( "CARD" )
		} );

	} );

	describe( "blockCard", () => {
		beforeEach( async () => {
			await api.blockCard( "CARDID", true, "because I said so" );
		} );

		it( "should patch /io/card/:cardId with expected params", async () => {
			got.should.be.calledOnce.and.calledWith( "BASEURL/io/card/CARDID", {
				method: "PATCH",
				json: [
					{ op: "replace", path: "/blockReason", value: "because I said so" },
					{ op: "replace", path: "/isBlocked", value: true }
				],
				headers: {
					Authorization: "Bearer APITOKEN"
				}
			})
		} );

		it( "should use json", () => {
			got.json.should.be.calledOnce();
		} );
	} );

	describe( "moveCard", () => {
		beforeEach( async () => {
			await api.moveCard( "CARDID", "LANEID", "OVERRIDE" );
		} );

		it( "should post /io/card/move with expected params", async () => {
			got.should.be.calledOnce.and.calledWith( "BASEURL/io/card/move", {
				method: "POST",
				json: {
					cardIds: [ "CARDID" ],
					destination: {
						laneId: "LANEID"
					},
					wipOverrideComment: "OVERRIDE"
				},
				headers: {
					Authorization: "Bearer APITOKEN"
				}
			})
		} );

		it( "should use json", () => {
			got.json.should.be.calledOnce();
		} );
	} );

	describe( "addComment", () => {
		beforeEach( async () => {
			await api.addComment( "CARDID", "COMMENT" );
		} );

		it( "should post /io/card/:cardId/comment with expected params", async () => {
			got.should.be.calledOnce.and.calledWith( "BASEURL/io/card/CARDID/comment", {
				method: "POST",
				json: {
					text: "COMMENT"
				},
				headers: {
					Authorization: "Bearer APITOKEN"
				}
			})
		} );

		it( "should use json", () => {
			got.json.should.be.calledOnce();
		} );
	} );

	describe( "createCard", () => {
		let id;
		beforeEach( async () => {
			got.json.resolves( { id: "123" } );
			id = await api.createCard( "CARD PROPS" );
		} );

		it( "should post /io/card with expected params", async () => {
			got.should.be.calledOnce.and.calledWith( "BASEURL/io/card", {
				method: "POST",
				json: "CARD PROPS",
				headers: {
					Authorization: "Bearer APITOKEN"
				}
			})
		} );

		it( "should use json", () => {
			got.json.should.be.calledOnce();
		} );

		it( "should return id", () => {
			id.should.eql( "123" );
		} );
	} );

	describe( "verifyCardPosition", () => {
		let result;
		beforeEach( async () => {
			got.json.resolves( { id: "123", lane: { id: "LANEID" } } );
			result = await api.verifyCardPosition( "CARDID", "LANEID" );
		} );

		it( "should get /io/card/:cardId with expected params", async () => {
			got.should.be.calledOnce.and.calledWith( "BASEURL/io/card/CARDID", {
				method: "GET",
				headers: {
					Authorization: "Bearer APITOKEN"
				}
			})
		} );

		it( "should use json", () => {
			got.json.should.be.calledOnce();
		} );

		it( "should return id", () => {
			result.should.equal(true);
		} );
	} );

	describe( "trailing slash on baseUrl", () => {
		it( "should remove the trailing slash", async () => {
			api = factory( "BASEURL/", "APITOKEN" );
			await api.getCard( "CARDID" );

			got.should.be.calledOnce.and.calledWith( "BASEURL/io/card/CARDID", {
				method: "GET",
				headers: {
					Authorization: "Bearer APITOKEN"
				}
			})
		} );

	} );

} );
