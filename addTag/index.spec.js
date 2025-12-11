"use strict";

const { sinon, proxyquire } = testHelpers;

describe( "addTag", () => {
	let apiFactory, addTag, getInputParams, validateLeankitUrl, reportError;
	function init() {
		getInputParams = sinon.stub().returns( [
			"HOST",
			"API_TOKEN",
			"CARDID",
			"MYTAG"
		] );
		reportError = sinon.stub();
		validateLeankitUrl = sinon.stub();
		addTag = sinon.stub();
		apiFactory = sinon.stub().returns( {
			addTag
		} );
	}

	function action() {
		return proxyquire( "~/addTag", {
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
				getInputParams.should.be.calledOnce.and.calledWith( {
					required: [
						"host",
						"apiToken",
						"cardId",
						"tag"
					]
				} );
			} );

			it( "should report error", async () => {
				reportError.should.be.calledOnce.and.calledWith( "addTag", error );
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
				validateLeankitUrl.should.be.calledOnce.and.calledWith( "host", "INVALID_HOST" );
			} );

			it( "should report error", () => {
				reportError.should.be.calledOnce.and.calledWith( "addTag", error );
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

		it( "should add tag to card", () => {
			addTag.should.be.calledOnce.and.calledWith( "CARDID", "MYTAG" );
		} );
	} );
} );
