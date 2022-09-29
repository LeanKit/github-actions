"use strict";

const { sinon, proxyquire } = testHelpers;

describe( "assignUsers", () => {
	let github, apiFactory, assignUsers, getInputParams, validateLeankitUrl, reportError;
	function init() {
		github = {
			context: {
				payload: {}
			}
		};

		getInputParams = sinon.stub().returns( [
			"HOST",
			"API_TOKEN",
			" c1,c2, c3",
			"USERS_TO_ASSIGN",
			"USERS_TO_UNASSIGN",
			"WIPOVERRIDE"
		] )
		reportError = sinon.stub();
		validateLeankitUrl = sinon.stub();
		assignUsers = sinon.stub();
		apiFactory = sinon.stub().returns( {
			assignUsers
		} );
	}

	function action() {
		return proxyquire( "~/assignUsers", {
			"../leankit/api": apiFactory,
			"../leankit/helpers": {
				getInputParams,
				reportError,
				validateLeankitUrl
			}
		} );
	}

	describe( "validation", () => {
		describe( "when validation fails", () => {
			beforeEach( async () => {
				init();
				getInputParams.throws( new Error( "Input required and not supplied: SOME PARAM" ) );
				await action();
			} );

			it( "should validate params", () => {
				getInputParams.should.be.calledOnce.and.calledWith({
					required: [
						"host",
						"apiToken",
						"cardIds"
					],
					optional: [
						"assignUserIds",
						"unassignUserIds",
						"wipOverrideComment"
					]
				} );
			} );

			it( "should report error", async () => {
				reportError.should.be.calledOnce.and.calledWith( "assignUsers", "Input required and not supplied: SOME PARAM" );
			} );
		} );

		describe("when neither assignUserIds nor unassignUserIds is present", () => {
			beforeEach( async () => {
				init();
				getInputParams.returns( [ "HOST" ] );
				await action();
			} );

			it( "should report error", async () => {
				reportError.should.be.calledOnce.and.calledWith( "assignUsers", "Either assignUserIds or unassignUserIds must be specified" );
			} );
		});

		describe( "with invalid host", () => {
			beforeEach( async () => {
				init();
				getInputParams.returns( [ "INVALID_HOST" ] );
				validateLeankitUrl.throws( new Error( "Expected a leankit url for 'host' action parameter" ))
				await action();
			} );

			it( "should validate host param", () => {
				validateLeankitUrl.should.be.calledOnce.and.calledWith( "host", "INVALID_HOST");
			} );

			it( "should report error", () => {
				reportError.should.be.calledOnce.and.calledWith( "assignUsers", "Expected a leankit url for 'host' action parameter" );
			} );
		} );
	} );

	describe( "with valid parameters", () => {
		beforeEach( async () => {
			init();
			await action();
		} );

		it( "should get leankit api", () => {
			apiFactory.should.be.calledOnce.and.calledWith( "HOST", "API_TOKEN" );
		} );

		it( "should assign the users to the cards", () => {
			assignUsers.should.be.calledOnce.and.calledWith( ["c1", "c2", "c3"], ["USERS_TO_ASSIGN"], ["USERS_TO_UNASSIGN"], "WIPOVERRIDE" );
		} );
	} );

	describe( "with an empty parameter", () => {
		beforeEach( async () => {
			init();
			getInputParams = sinon.stub().returns( [
				"HOST",
				"API_TOKEN",
				" c1,c2, c3",
				"USERS_TO_ASSIGN",
				"",
				"WIPOVERRIDE"
			] )
			await action();
		} );

		it( "should get leankit api", () => {
			apiFactory.should.be.calledOnce.and.calledWith( "HOST", "API_TOKEN" );
		} );

		it( "should assign the users to the cards", () => {
			assignUsers.should.be.calledOnce.and.calledWith( ["c1", "c2", "c3"], ["USERS_TO_ASSIGN"], [], "WIPOVERRIDE" );
		} );
	} );
} );
