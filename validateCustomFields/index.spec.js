"use strict";

const { sinon, proxyquire } = testHelpers;

describe( "validateCustomFields", () => {
	let apiFactory,
		getInputParams,
		validateLeankitUrl,
		setOutput,
		getCard,
		reportError,
		providedCustomFields;

	function init() {
		getInputParams = sinon.stub().returns( [
			"HOST",
			"API_TOKEN",
			"CARDID",
			"My Field Label, Field One, 12345, anotherLabel",
			"[{\"fieldId\": \"123\",\"label\":\"Field One\",\"value\":\"VALUE ONE\"}]"
		] )
		providedCustomFields
		reportError = sinon.stub();
		validateLeankitUrl = sinon.stub();
		getCard = sinon.stub().resolves({
			customFields: [
				{ fieldId: "123", label: "Field One", value: "VALUE ONE" },
				{ fieldId: "456", label: "Field Two", value: "VALUE TWO" },
				{ fieldId: "789", label: "Field null", value: null },
				{ fieldId: "1000", label: "Field null" },
				{ fieldId: "1001", label: "Field empty", value: "" }
			]
		})
		setOutput = sinon.stub();
		apiFactory = sinon.stub().returns( {
			getCard
		} );
	}

	function action() {
		return proxyquire( "~/validateCustomFields", {
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
						"cardId",
						"requiredCustomFields"
					],
					optional: [
						"customFields"
					]
				} );
			} );

			it( "should report error", async () => {
				reportError.should.be.calledOnce.and.calledWith( "validateCustomFields", "Input required and not supplied: SOME PARAM" );
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
				reportError.should.be.calledOnce.and.calledWith( "validateCustomFields", "Expected a leankit url for 'host' action parameter" );
			} );
		} );
	} );

	describe( "with valid input params", () => {
		beforeEach( async () => {
			init();
			await action();
		} );

		it( "should get leankit api", () => {
			apiFactory.should.be.calledOnce.and.calledWith( "HOST", "API_TOKEN" );
		} );

		describe( "with provided custom fields and missing fields", () => {
			beforeEach( async () => {
				init();
				await action();
			} );

			it( "should not get the card", () => {
				getCard.should.not.be.called();
			} );

			it( "should set customFields output with parsed fields", () => {
				setOutput.getCall( 0 ).should.be.calledWith( "customFields", [ { fieldId: "123", label: "Field One", value: "VALUE ONE" } ] )
			} );

			it( "should set customFieldsByLabel output", () => {
				setOutput.getCall( 1 ).should.be.calledWith( "customFieldsByLabel", { 'field one': 'VALUE ONE' } );
			} );

			it( "should set customFieldsById output", () => {
				setOutput.getCall( 2 ).should.be.calledWith( "customFieldsById", { '123': 'VALUE ONE' } );
			} );

			it( "should report missing fields", () => {
				reportError.should.be.calledOnce.and.calledWith( "validateCustomFields", "Card is missing required custom fields: My Field Label, 12345, anotherLabel" );
			} );
		} );

		describe( "with no provided custom fields", () => {
			beforeEach( async () => {
				init();
				getInputParams.returns( [
					"HOST",
					"API_TOKEN",
					"CARDID",
					"My Field Label, 12345, anotherLabel"
				] )

				await action();
			} );

			it( "should get the card", () => {
				getCard.should.be.calledOnce.and.calledWith( "CARDID" );
			} );

			it( "should set customFields output with fields from card", () => {
				setOutput.getCall( 0 ).should.be.calledWith( "customFields", [
					{ fieldId: "123", label: "Field One", value: "VALUE ONE" },
					{ fieldId: "456", label: "Field Two", value: "VALUE TWO" },
					{ fieldId: "789", label: "Field null", value: null },
					{ fieldId: "1000", label: "Field null" },
					{ fieldId: "1001", label: "Field empty", value: "" }
					] )
			} );
		} );

		describe( "with no missing fields", () => {
			beforeEach( async () => {
				init();
				getInputParams.returns( [
					"HOST",
					"API_TOKEN",
					"CARDID",
					"field ONE, 456"
				] )

				await action();
			} );

			it( "should not report error", () => {
				reportError.should.not.be.called();
			} );

		} );

	} );
} );
