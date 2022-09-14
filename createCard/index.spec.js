"use strict";

const { sinon, proxyquire } = testHelpers;

describe( "createCard", () => {
	let apiFactory, expectedCardPayload, validateLeankitUrl, setOutput, getInputParams, reportError, createCard;
	function init() {
		setOutput = sinon.stub();
		getInputParams = sinon.stub().returns( [
			"https://acme.leankit.com",
			"API_TOKEN",
			"BOARDID",
			"TITLE",
			"LANEID",
			"TYPEID"
		] );
		reportError = sinon.stub();
		validateLeankitUrl = sinon.stub();
		createCard = sinon.stub();
		apiFactory = sinon.stub().returns( {
			createCard
		} );
		expectedCardPayload = {
			boardId: "BOARDID",
			title: "TITLE",
			laneId: "LANEID",
			typeId: "TYPEID"
		 };
	}

	function action() {
		return proxyquire( "~/createCard", {
			"@actions/core": { setOutput },
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
						"boardId",
						"title"
					],
					optional: [
						"laneId",
						"typeId"
					]
				} );
			} );

			it( "should report error", async () => {
				reportError.should.be.calledOnce.and.calledWith( "createCard", "Input required and not supplied: SOME PARAM" );
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
				reportError.should.be.calledOnce.and.calledWith( "createCard", "Expected a leankit url for 'host' action parameter" );
			} );
		} );
	} );

	describe( "with valid parameters including optional lane id and type id provided", () => {
		beforeEach( async () => {
			init();
			createCard.resolves( "32423423" );
			await action();
		} );

		it( "should get leankit api", () => {
			apiFactory.should.be.calledOnce.and.calledWith( "https://acme.leankit.com", "API_TOKEN" );
		} );

		it( "should create card in expected lane", () => {
			createCard.should.be.calledOnce.and.calledWith( expectedCardPayload );
		} );

		it( "should set output 'createdCardId'", () => {
			setOutput.should.be.calledOnce.and.calledWith( "createdCardId", "32423423" );
		} );
	} );

	describe( "with valid required parameters only", () => {
		beforeEach( async () => {
			init();
			getInputParams = sinon.stub().returns( [
				"https://acme.leankit.com",
				"API_TOKEN",
				"BOARDID",
				"TITLE",
				"",
				""
			] );
			createCard.resolves( "32423423" );
			delete expectedCardPayload.laneId;
			delete expectedCardPayload.typeId;

			await action();
		} );

		it( "should create card with default type in default drop lane", () => {
			createCard.should.be.calledOnce.and.calledWith( expectedCardPayload );
		} );
	} );
} );
