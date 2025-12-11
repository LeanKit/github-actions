"use strict";

const { sinon, proxyquire } = testHelpers;

describe( "hasTag", () => {
	let apiFactory, getCard, getInputParams, validateLeankitUrl, reportError, setOutput;
	function init() {
		getInputParams = sinon.stub().returns( [
			"HOST",
			"API_TOKEN",
			"CARDID",
			"MYTAG"
		] );
		reportError = sinon.stub();
		validateLeankitUrl = sinon.stub();
		setOutput = sinon.stub();
		getCard = sinon.stub().resolves( {
			tags: [ "Tag1", "MyTag", "AnotherTag" ]
		} );
		apiFactory = sinon.stub().returns( {
			getCard
		} );
	}

	function action() {
		return proxyquire( "~/hasTag", {
			"@actions/core": {
				setOutput
			},
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
				reportError.should.be.calledOnce.and.calledWith( "hasTag", error );
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
				reportError.should.be.calledOnce.and.calledWith( "hasTag", error );
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

		it( "should get card", () => {
			getCard.should.be.calledOnce.and.calledWith( "CARDID" );
		} );

		it( "should output tags", () => {
			setOutput.should.be.calledWith( "tags", [ "Tag1", "MyTag", "AnotherTag" ] );
		} );

		it( "should output hasTag as true for case insensitive match", () => {
			setOutput.should.be.calledWith( "hasTag", true );
		} );
	} );

	describe( "when tag does not exist", () => {
		beforeEach( async () => {
			init();
			getInputParams.returns( [
				"HOST",
				"API_TOKEN",
				"CARDID",
				"NonExistentTag"
			] );
			await action();
		} );

		it( "should output hasTag as false", () => {
			setOutput.should.be.calledWith( "hasTag", false );
		} );
	} );

	describe( "case insensitive matching", () => {
		beforeEach( async () => {
			init();
			getInputParams.returns( [
				"HOST",
				"API_TOKEN",
				"CARDID",
				"mytag"
			] );
			await action();
		} );

		it( "should match tag case insensitively", () => {
			setOutput.should.be.calledWith( "hasTag", true );
		} );
	} );

	describe( "when card has no tags", () => {
		beforeEach( async () => {
			init();
			getCard.resolves( { tags: [] } );
			await action();
		} );

		it( "should output empty tags array", () => {
			setOutput.should.be.calledWith( "tags", [] );
		} );

		it( "should output hasTag as false", () => {
			setOutput.should.be.calledWith( "hasTag", false );
		} );
	} );
} );
