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
			"TYPEID",
            "CUSTOMID",
            "EXTERNALLINK",
			"LINKLABEL"
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
			typeId: "TYPEID",
            customId: "CUSTOMID",
            externalLink: "EXTERNALLINK",
			linkLabel: "LINKLABEL"
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
			const error = new Error( "Input required and not supplied: SOME PARAM" );
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
						"boardId",
						"title"
					],
					optional: [
                        "laneId",
						"typeId",
						"customId",
                        "externalLink",
						"linkLabel"
					]
				} );
			} );

			it( "should report error", async () => {
				reportError.should.be.calledOnce.and.calledWith( "createCard", error );
			} );
		} );

		describe( "with invalid host", () => {
			const error = new Error( "Expected a leankit url for 'host' action parameter" );
			beforeEach( async () => {
				init();
				getInputParams.returns( [ "INVALID_HOST" ] );
				validateLeankitUrl.throws( error )
				await action();
			} );

			it( "should validate host param", () => {
				validateLeankitUrl.should.be.calledOnce.and.calledWith( "host", "INVALID_HOST");
			} );

			it( "should report error", () => {
				reportError.should.be.calledOnce.and.calledWith( "createCard", error );
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
                "",
				"",
				"",
				""
			] );
			createCard.resolves( "32423423" );
			delete expectedCardPayload.laneId;
			delete expectedCardPayload.typeId;
			delete expectedCardPayload.customId;
			delete expectedCardPayload.externalLink;
			delete expectedCardPayload.linkLabel;

			await action();
		} );

		it( "should create card with default type in default drop lane", () => {
			createCard.should.be.calledOnce.and.calledWith( expectedCardPayload );
		} );
	} );
} );
