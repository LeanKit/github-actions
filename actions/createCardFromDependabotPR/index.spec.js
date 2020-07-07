"use strict";

const { coerce } = require("../randomNumber/dist");

const { sinon, proxyquire } = testHelpers;

describe( "createCardFromDependabotPR index", () => {
	let instance, github, apiFactory, api, getInput, setOutput, getBoard, createCard;
	function init() {
		github = {
			context: {
				payload: {}
			}
		};
		setOutput = sinon.stub();
		getInput = sinon.stub()
			.onCall( 0 ).returns( "https://acme.leankit.com/board/1234" )
			.onCall( 1 ).returns( "API_TOKEN" )
			.onCall( 2 ).returns( "456" )
			.onCall( 3 ).returns( "789" );
		
		getBoard = sinon.stub();
		createCard = sinon.stub();
		apiFactory = sinon.stub().returns( {
			getBoard, createCard
		});
	}

	function action() {
		return proxyquire( "~/actions/createCardFromDependabotPR", {
			"@actions/core": { getInput, setOutput },
			"@actions/github": github,
			"./api/leankit": apiFactory
		} );
	}

	describe( "validation", () => {
		describe( "with missing leankit-board-url", () => { 
			it( "should throw", async () => { 
				init();
				getInput.onCall( 0 ).returns( null );
				try{
					await action();
				} catch( ex ) {
					ex.message.should.equal( "Expected 'leankit-board-url' action parameter" );
				}
			} );	
		} );

		describe( "with invalid leankit-board-url", () => { 
			it( "should throw", async () => { 
				init();
				getInput.onCall( 0 ).returns( "bob" );
				try{
					await action();
				} catch( ex ) {
					ex.message.should.equal( "Expected a url for 'leankit-board-url' action parameter" );
				}
			} );	
		} );
		
		describe( "with invalid api-token parameter", () => { 
			it( "should throw", async () => { 
				init();
				getInput.onCall( 1 ).returns( null );
				try{
					await action();
				} catch( ex ) {
					ex.message.should.equal( "Expected 'api-token' action parameter" );
				}
			} );	
		} );
		
		describe( "with invalid review-lane parameter", () => { 
			it( "should throw", async () => { 
				init();
				getInput.onCall( 2 ).returns( null );
				try{
					await action();
				} catch( ex ) {
					ex.message.should.equal( "Expected 'review-lane' action parameter" );
				}
			} );	
		} );
		
		describe( "with invalid ready-to-merge-lane parameter", () => { 
			it( "should throw", async () => { 
				init();
				getInput.onCall( 3 ).returns( null );
				try{
					await action();
				} catch( ex ) {
					ex.message.should.equal( "Expected 'ready-to-merge-lane' action parameter" );
				}
			} );	
		} );
		
		describe( "when trigger is not a PR", () => { 
			it( "should throw", async () => { 
				init();
				try {
					await action();
				} catch( ex ) {
					ex.message.should.equal( "This action may be triggered by a pull_request only." );
				}				
			} );
		} );

		describe( "when the pr does not have an expected title", () => { 
			beforeEach( async () => { 
				init();
				github.context.payload = {
					pull_request: {
						number: "200",
						title: "Just some change",
						user: {
							login: "dependabot"
						}
					}
				}
				await action();
			} );
			
			it( "should set result message", () => { 
				setOutput.should.be.calledOnce.and.calledWith( "result", {
					message: "ignoring PR #200 'Just some change' from dependabot"
				} );
			} );

			it( "should not get leankit api", () => { 
				apiFactory.should.not.be.calledOnce();
			} );
		} );

		describe( "when the pr is not from dependabot", () => { 
			beforeEach( async () => { 
				init();
				github.context.payload = {
					pull_request: {
						number: "200",
						title: "Bump eslint from 4.19.1 to 4.19.4",
						user: {
							login: "larrythecucumber"
						}
					}
				}
				await action();
			} );
			
			it( "should set result message", () => { 
				setOutput.should.be.calledOnce.and.calledWith( "result", {
					message: "ignoring PR #200 'Bump eslint from 4.19.1 to 4.19.4' from larrythecucumber"
				} );
			} );

			it( "should not get leankit api", () => { 
				apiFactory.should.not.be.calledOnce();
			} );
		} );
		

		
	} );
	
	describe( "with valid parameters and lane ids provided", () => { 
		describe( "with a minor version bump", () => { 
			beforeEach( async () => { 
				init();
				github.context.payload = {
					pull_request: {
						number: "250",
						title: "Bump eslint from 4.19.1 to 4.19.4",
						user: {
							login: "dependabot"
						}
					}
				}
				createCard.returns( "32423423" );
				await action();
			} );
			
			it( "should get leankit api", () => { 
				apiFactory.should.be.calledOnce.and.calledWith( "https://acme.leankit.com", "API_TOKEN" );
			} );
			
			it( "should create card in expected lane", () => { 
				createCard.should.be.calledOnce.and.calledWith( {
					title: "Bump eslint from 4.19.1 to 4.19.4",
					laneId: "789"
				 } );
			} );

			it( "should set result", () => { 
				setOutput.should.be.calledOnce.and.calledWith( "result", {
					createdCardId: "32423423"
				} );
			} );
			
			
		} );
		
		
	} );
	
} );
