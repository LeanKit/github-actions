"use strict";

const { sinon, proxyquire } = testHelpers;

describe( "extractCardId", () => {
	let getInputParams, setOutput, reportError;

	beforeEach( () => {
		getInputParams = sinon.stub();
		setOutput = sinon.stub();
		reportError = sinon.stub();
	} );

	function action( title ) {
		if( title ) {
			getInputParams.returns( [ title	] );
		}

		return proxyquire( "~/extractCardId", {
			"../leankit/helpers": {
				getInputParams,
				reportError,
				setOutput
			}
		} );
	}

	describe( "validation", () => {
		describe( "when validation fails", () => {
			const error = new Error( "Input required and not supplied: SOME PARAM" );
			beforeEach( async () => {
				getInputParams.throws( error );
				await action();
			} );

			it( "should validate params", () => {
				getInputParams.should.be.calledOnce.and.calledWith({
					required: [
						"inputText"
					]
				} );
			} );

			it( "should report error", async () => {
				reportError.should.be.calledOnce.and.calledWith( "extractCardId", error );
			} );
		} );
	} );

	describe( "with valid parameters", () => {
		it( "should output expected card id with format (LK:12345)", async () => {
			await action( "MY TEST PR TITLE (LK:12345)" );

			setOutput.should.be.calledOnce.and.calledWith( "cardId", "12345" );
		} );

		it( "should output expected card id with format (AP:12345)", async () => {
			await action( "MY TEST PR TITLE (AP:12345)" );

			setOutput.should.be.calledOnce.and.calledWith( "cardId", "12345" );
		} );

		it( "should output expected card id with format (card 12345)", async () => {
			await action( "MY TEST PR TITLE (card 12345)" );

			setOutput.should.be.calledOnce.and.calledWith( "cardId", "12345" );
		} );

		it( "should output expected card id with format (12345)", async () => {
			await action( "MY TEST PR TITLE (12345)" );

			setOutput.should.be.calledOnce.and.calledWith( "cardId", "12345" );
		} );

		it( "should output expected card id with format (cardId: 12345)", async () => {
			await action( "MY TEST PR TITLE (cardId: 12345)" );

			setOutput.should.be.calledOnce.and.calledWith( "cardId", "12345" );
		} );

		it( "should not output card id with no match", async () => {
			await action( "MY TEST PR TITLE" );

			setOutput.should.not.be.called();
		} );
	} );
} );
