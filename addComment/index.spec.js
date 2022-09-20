"use strict";

const { sinon, proxyquire } = testHelpers;

describe( "addComment", () => {
	let github, apiFactory, addComment, getInputParams, validateLeankitUrl, reportError;
	function init() {
		github = {
			context: {
				payload: {}
			}
		};

		getInputParams = sinon.stub().returns( [
			"HOST",
			"API_TOKEN",
			"CARDID",
			"COMMENT"
		] )
		reportError = sinon.stub();
		validateLeankitUrl = sinon.stub();
		addComment = sinon.stub();
		apiFactory = sinon.stub().returns( {
			addComment
		} );
	}

	function action() {
		return proxyquire( "~/addComment", {
			"../leankit/api": apiFactory,
			"../leankit/helpers": {
				getInputParams,
				reportError,
				validateLeankitUrl
			}
		} );
	}

	describe( "validation", () => {
		const error = new Error( "VALIDATION ERROR" );
		describe( "when validation fails", () => {
			beforeEach( async () => {
				init();
				getInputParams.throws( error );
				await action();
			} );

			it( "should validate params", () => {
				getInputParams.should.be.calledOnce.and.calledWith({
					required: [
						"host",
						"apiToken",
						"cardId",
						"comment"
					]
				} );
			} );

			it( "should report error", async () => {
				reportError.should.be.calledOnce.and.calledWith( "addComment", error );
			} );
		} );

		describe( "with invalid host", () => {
			beforeEach( async () => {
				init();
				getInputParams.returns( [ "INVALID_HOST" ] );
				validateLeankitUrl.throws( error );
				await action();
			} );

			it( "should validate host param", () => {
				validateLeankitUrl.should.be.calledOnce.and.calledWith( "host", "INVALID_HOST");
			} );

			it( "should report error", () => {
				reportError.should.be.calledOnce.and.calledWith( "addComment", error );
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

		it( "should add comment to expected card", () => {
			addComment.should.be.calledOnce.and.calledWith( "CARDID", "COMMENT");
		} );
	} );
} );
