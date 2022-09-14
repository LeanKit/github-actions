"use strict";

const { expect, should } = require("chai");

const { sinon, proxyquire } = testHelpers;

describe( "leankit/helpers", () => {
	let helpers, getInput, getBooleanInput, setFailed, setOutput, exportVariable;
	beforeEach( () => {
		getInput = sinon.stub();
		getBooleanInput = sinon.stub();
		setFailed = sinon.stub();
		setOutput = sinon.stub();
		exportVariable = sinon.stub();

		helpers = proxyquire( "~/leankit/helpers", {
			"@actions/core": {
				getInput,
				getBooleanInput,
				setFailed,
				setOutput,
				exportVariable
			}
		})
	} );

	describe( "getInputParams", () => {
		describe( "with value missing from required param", () => {
			let message;
			beforeEach( () => {
				getInput.throws( new Error( "Input required and not supplied: myRequiredParam" ) )
				try {
					helpers.getInputParams( { required: [ "myRequiredParam" ] } );
				} catch( ex) {
					( { message } = ex );
				}
			} );

			it( "should use getInput with required flag", () => {
				getInput.should.be.calledOnce.and.calledWith( "myRequiredParam", { required: true } )
			} );

			it( "should throw expected message", () => {
				message.should.equal( "Input required and not supplied: myRequiredParam" );
			} );


		} );

		describe( "with value available from required param", () => {
			let result;
			beforeEach( () => {
				getInput.onCall( 0 ).returns( "VALUE 0" );
				getInput.onCall( 1 ).returns( "VALUE 1" );
				result = helpers.getInputParams( { required: [ "myRequiredParam", "myOtherRequiredParam" ] } );
			} );

			it( "should use getInput with required flag", () => {
				getInput.should.be.calledTwice()
				getInput.should.be.and.calledWith( "myRequiredParam", { required: true } )
				getInput.should.be.and.calledWith( "myOtherRequiredParam", { required: true } )
			} );

			it( "should return expected array", () => {
				result.should.eql( [
					"VALUE 0",
					"VALUE 1"
				] );
			} );
		} );

		describe( "with value from optional param", () => {
			let result;
			beforeEach( () => {
				getInput.onCall( 0 ).returns( "OPTIONAL VALUE 1" );
				result = helpers.getInputParams( { optional: [ "myOptionalParam" ] } );
			} );

			it( "should use getInput with and without required flag", () => {
				getInput.should.be.calledOnce.and.calledWith( "myOptionalParam" )
			} );

			it( "should return expected array", () => {
				result.should.eql( [
					"OPTIONAL VALUE 1"
				] );
			} );
		} );

		describe( "with boolean values", () => {
			let result;
			beforeEach( () => {
				getInput.returns( "string value" );
				getBooleanInput.onCall( 0 ).returns( true );
				getBooleanInput.onCall( 1 ).returns( false );
				result = helpers.getInputParams( {
					required: [ "PARAM 1" ],
					optional: [ "PARAM 2", "PARAM 3" ],
					asBoolean: [ "PARAM 1", "PARAM 3" ]
				} );
			} );

			it( "should use getInput for string param", () => {
				getInput.should.be.calledOnce.and.calledWith( "PARAM 2" );
			} );

			it( "should use getBooleanInput for boolean params", () => {
				getBooleanInput.should.be.calledTwice();
				getBooleanInput.should.be.calledWith( "PARAM 1", { required: true } )
				getBooleanInput.should.be.calledWith( "PARAM 3" )
			} );

			it( "should return expected array", () => {
				result.should.eql( [
					true,
					"string value",
					false
				] );
			} );
		} );
	} );
	describe( "reportError", () => {

		beforeEach( () => {
			helpers.reportError( "someAction", "ERROR_MESSAGE" );
		} );

		it( "should set output for 'error'", () => {
			setOutput.should.be.calledOnce.and.calledWith( "error", "someAction error: ERROR_MESSAGE" );
		} );

		it( "should export env variable 'LK_ERROR_MESSAGE'", () => {
			exportVariable.should.be.calledOnce.and.calledWith( "LK_ERROR_MESSAGE", "someAction error: ERROR_MESSAGE" );
		} );

		it( "should set failed with error", () => {
			setFailed.should.be.calledOnce.and.calledWith( "someAction error: ERROR_MESSAGE" );
		} );
	} );

	describe( "validateLeankitUrl", () => {
		describe( "valid variations", () => {
			it( "should allow leankit.com", () => {
				expect( () => helpers.validateLeankitUrl( "PROP NAME", "https://acme.leankit.com") ).to.not.throw();
			} );

			it( "should allow leankit.io", () => {
				expect( () => helpers.validateLeankitUrl( "PROP NAME", "https://ronco.leankit.io") ).to.not.throw();
			} );

			it( "should allow localkanban.com", () => {
				expect( () => helpers.validateLeankitUrl( "PROP NAME", "https://ubuy.localkanban.com") ).to.not.throw();
			} );

			it( "should allow trailing slash", () => {
				expect( () => helpers.validateLeankitUrl( "PROP NAME", "https://dbsrus.leankit.com/") ).to.not.throw();
			} );
		} );

		describe( "anyhing else", () => {
			it( "should throw", () => {
				expect( () => helpers.validateLeankitUrl( "PROP NAME", "bob.leankit.com") ).to.throw();
			} );

		} );


	} );


} );
