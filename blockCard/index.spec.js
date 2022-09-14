"use strict";

const { sinon, proxyquire } = testHelpers;

describe( "blockCard", () => {
	let apiFactory, blockCard, getInputParams, validateLeankitUrl, reportError;
	function init() {
		getInputParams = sinon.stub().returns( [
			"HOST",
			"API_TOKEN",
			"CARDID",
			true,
			"BLOCKREASON"
		] )
		reportError = sinon.stub();
		validateLeankitUrl = sinon.stub();
		blockCard = sinon.stub();
		apiFactory = sinon.stub().returns( {
			blockCard
		} );
	}

	function action() {
		return proxyquire( "~/blockCard", {
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
						"cardId",
						"isBlocked"
					],
					optional: [
						"blockReason"
					],
					asBoolean: [ "isBlocked" ]
				} );
			} );

			it( "should report error", async () => {
				reportError.should.be.calledOnce.and.calledWith( "blockCard", "Input required and not supplied: SOME PARAM" );
			} );
		} );

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
				reportError.should.be.calledOnce.and.calledWith( "blockCard", "Expected a leankit url for 'host' action parameter" );
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

		it( "should block card", () => {
			blockCard.should.be.calledOnce.and.calledWith( "CARDID", true, "BLOCKREASON" );
		} );
	} );
} );
