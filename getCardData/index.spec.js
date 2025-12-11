"use strict";

const { sinon, proxyquire } = testHelpers;

describe( "getCardData", () => {
	let apiFactory, getCard, getInputParams, setOutput, validateLeankitUrl, reportError;
	function init() {
		getInputParams = sinon.stub().returns( [
			"HOST",
			"API_TOKEN",
			"CARDID"
		] );
		setOutput = sinon.stub();
		reportError = sinon.stub();
		validateLeankitUrl = sinon.stub();
		getCard = sinon.stub().resolves( { id: "CARDID", title: "Test Card" } );
		apiFactory = sinon.stub().returns( {
			getCard
		} );
	}

	function action() {
		return proxyquire( "~/getCardData", {
			"../leankit/api": apiFactory,
			"../leankit/helpers": {
				getInputParams,
				setOutput,
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
						"cardId"
					]
				} );
			} );

			it( "should report error", async () => {
				reportError.should.be.calledOnce.and.calledWith( "getCardData", error );
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
				reportError.should.be.calledOnce.and.calledWith( "getCardData", error );
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

		it( "should get card data", () => {
			getCard.should.be.calledOnce.and.calledWith( "CARDID" );
		} );

		it( "should output card data as JSON", () => {
			setOutput.should.be.calledOnce.and.calledWith( "cardData", JSON.stringify( { id: "CARDID", title: "Test Card" } ) );
		} );
	} );
} );
