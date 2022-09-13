"use strict";

const { dnsLookupIpVersionToFamily } = require("got/dist/source/core/utils/dns-ip-version");

const { sinon, proxyquire } = testHelpers;

const DEPENDABOT_LOGIN = "dependabot";

describe.only( "createCardFromDependabotPR index", () => {
	let github, apiFactory, cardDefinition, getInput, setOutput, setFailed, getBoard, createCard;
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
			.onCall( 3 ).returns( "789" )
			.onCall( 4 ).returns( "23456" );
		setFailed = sinon.stub();
		getBoard = sinon.stub();
		createCard = sinon.stub();
		apiFactory = sinon.stub().returns( {
			getBoard, createCard
		} );
		cardDefinition = {
			boardId: "1234",
			title: "Bump eslint from 4.19.1 to 4.19.4",
			customId: "dependabot",
			externalLink: {
				url: "PULL_REQUEST_URL",
				label: "PR"
			},
			typeId: "23456",
			laneId: "789"
		 }; 
	}

	function action() {
		return proxyquire( "~/actions/createCardFromDependabotPR", {
			"@actions/core": { getInput, setOutput, setFailed },
			"@actions/github": github,
			"./api/leankit": apiFactory
		} );
	}
	
	describe( "validation", () => {
		describe( "with missing leankit-board-url", () => {
			it( "should set failed message", async () => {
				init();
				getInput.onCall( 0 ).returns( null );
				await action();
				setFailed.should.be.calledOnce.and.calledWith( "Expected 'leankit-board-url' action parameter" );
			} );
		} );

		describe( "with invalid leankit-board-url", () => {
			it( "should set failed message", async () => {
				init();
				getInput.onCall( 0 ).returns( "bob" );
				await action();
				setFailed.should.be.calledOnce.and.calledWith( "Expected a url for 'leankit-board-url' action parameter" );
			} );
		} );

		describe( "with invalid api-token parameter", () => {
			it( "should set failed message", async () => {
				init();
				getInput.onCall( 1 ).returns( null );
				await action();
				setFailed.should.be.calledOnce.and.calledWith( "Expected 'api-token' action parameter" );
			} );
		} );

		describe( "with invalid review-lane parameter", () => {
			it( "should set failed message", async () => {
				init();
				getInput.onCall( 2 ).returns( null );
				await action();
				setFailed.should.be.calledOnce.and.calledWith( "Expected 'review-lane' action parameter" );
			} );
		} );

		describe( "with invalid ready-to-merge-lane parameter", () => {
			it( "should set failed message", async () => {
				init();
				getInput.onCall( 3 ).returns( null );
				await action();
				setFailed.should.be.calledOnce.and.calledWith( "Expected 'ready-to-merge-lane' action parameter" );
			} );
		} );

		describe( "when trigger is not a PR", () => {
			it( "should set failed message", async () => {
				init();
				await action();
				setFailed.should.be.calledOnce.and.calledWith( "This action may be triggered by a pull_request only." );
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
							login: DEPENDABOT_LOGIN
						}
					}
				};
				await action();
			} );

			it( "should set result message", () => {
				setOutput.should.be.calledOnce.and.calledWith( "message", 
					`Ignoring PR #200 'Just some change' from ${ DEPENDABOT_LOGIN }` );
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
				};
				await action();
			} );
			
			it( "should set result message", () => {
				setOutput.should.be.calledOnce.and.calledWith( "message",
					"Ignoring PR #200 'Bump eslint from 4.19.1 to 4.19.4' from larrythecucumber" );
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
							login: DEPENDABOT_LOGIN
						},
						html_url: "PULL_REQUEST_URL"
					}
				};
				createCard.returns( "32423423" );
				await action();
			} );

			it( "should get leankit api", () => {
				apiFactory.should.be.calledOnce.and.calledWith( "https://acme.leankit.com", "API_TOKEN" );
			} );

			it( "should create card in expected lane", () => {			
				createCard.should.be.calledOnce.and.calledWith( cardDefinition );
			} );

			it( "should set output 'created-card-id'", () => {
				setOutput.should.be.calledOnce.and.calledWith( "created-card-id", "32423423" );
			} );
		} );

		describe( "with a major version bump", () => {
			beforeEach( async () => {
				init();
				github.context.payload = {
					pull_request: {
						number: "250",
						title: "Bump eslint from 4.19.1 to 5.19.4",
						user: {
							login: DEPENDABOT_LOGIN
						},
						html_url: "PULL_REQUEST_URL"
					}
				};
				createCard.returns( "32423423" );
				await action();
			} );

			it( "should get leankit api", () => {
				apiFactory.should.be.calledOnce.and.calledWith( "https://acme.leankit.com", "API_TOKEN" );
			} );

			it( "should create card in expected lane", () => {
				createCard.should.be.calledOnce.and.calledWith( {
					...cardDefinition,
					title: "Bump eslint from 4.19.1 to 5.19.4",
					laneId: "456"
				 } );
			} );

			it( "should set output 'created-card-id'", () => {
				setOutput.should.be.calledOnce.and.calledWith( "created-card-id", "32423423" );
			} );
		} );
	} );

	describe( "with valid parameters and lane titles provided", () => {
		beforeEach( () => { 
			init();
			getBoard.resolves({
				lanes: [
					{
						id: "1",
						name: "one"
					},
					{
						id: "456",
						name: "READY TO REVIEW"
					},
					{
						id: "789",
						name: "Ready to Merge"
					},
					{
						id: "987",
						name: "Ready to Merge"
					}
				]
			} );
			getInput.onCall( 2 ).returns( "Ready to Review" );
			getInput.onCall( 3 ).returns( "ready to merge" );
		} );
		
		describe( "with a minor version bump", () => {
			beforeEach( async () => {
				github.context.payload = {
					pull_request: {
						number: "250",
						title: "Bump eslint from 4.19.1 to 4.19.4",
						user: {
							login: DEPENDABOT_LOGIN
						},
						html_url: "PULL_REQUEST_URL"
					}
				};
				createCard.returns( "32423423" );
				await action();
			} );

			it( "should get leankit api", () => {
				apiFactory.should.be.calledOnce.and.calledWith( "https://acme.leankit.com", "API_TOKEN" );
			} );

			it( "should get the board", () => { 
				getBoard.should.be.calledOnce.and.calledWith( "1234" );
			} );
			
			it( "should create card in 'ready to merge' lane", () => {
				createCard.should.be.calledOnce.and.calledWith( cardDefinition );
			} );

			it( "should set output 'created-card-id'", () => {
				setOutput.should.be.calledOnce.and.calledWith( "created-card-id", "32423423" );
			} );
		} );

		describe( "with a major version bump", () => {
			beforeEach( async () => {
				github.context.payload = {
					pull_request: {
						number: "250",
						title: "Bump eslint from 4.19.1 to 5.19.4",
						user: {
							login: DEPENDABOT_LOGIN
						},
						html_url: "PULL_REQUEST_URL"
					}
				};
				createCard.returns( "32423423" );
				await action();
			} );
		
			it( "should create card in 'ready to review' lane", () => {
				createCard.should.be.calledOnce.and.calledWith( {
					...cardDefinition,
					title: "Bump eslint from 4.19.1 to 5.19.4",
					laneId: "456"
				 } );
			} );
		} );
	} );

	describe( "with valid parameters and 'ready to review' lane id provided", () => {
		beforeEach( () => { 
			init();
			getBoard.resolves({
				lanes: [
					{
						id: "1",
						name: "one"
					},
					{
						id: "456",
						name: "READY TO REVIEW"
					},
					{
						id: "789",
						name: "Ready to Merge"
					},
					{
						id: "987",
						name: "Ready to Merge"
					}
				]
			} );
			getInput.onCall( 2 ).returns( "ready to review" );
			getInput.onCall( 3 ).returns( "789" );
		} );
		
		describe( "with a minor version bump", () => {
			beforeEach( async () => {
				github.context.payload = {
					pull_request: {
						number: "250",
						title: "Bump eslint from 4.19.1 to 4.19.4",
						user: {
							login: DEPENDABOT_LOGIN
						},
						html_url: "PULL_REQUEST_URL"
					}
				};
				createCard.returns( "32423423" );
				await action();
			} );

			it( "should get leankit api", () => {
				apiFactory.should.be.calledOnce.and.calledWith( "https://acme.leankit.com", "API_TOKEN" );
			} );

			it( "should get the board", () => { 
				getBoard.should.be.calledOnce.and.calledWith( "1234" );
			} );
			
			it( "should create card in 'ready to merge' lane", () => {
				createCard.should.be.calledOnce.and.calledWith( cardDefinition );
			} );

			it( "should set output 'created-card-id'", () => {
				setOutput.should.be.calledOnce.and.calledWith( "created-card-id", "32423423" );
			} );
		} );
	} );

	describe( "when 'ready to review' lane is invalid", () => {
		beforeEach( () => { 
			init();
			getBoard.resolves({
				lanes: [
					{
						id: "1",
						name: "one"
					},
					{
						id: "456",
						name: "READY TO REVIEW"
					},
					{
						id: "789",
						name: "Ready to Merge"
					},
					{
						id: "987",
						name: "Ready to Merge"
					}
				]
			} );
			getInput.onCall( 2 ).returns( "INVALID" );
			getInput.onCall( 3 ).returns( "789" );
		} );
		
		describe( "with a minor version bump", () => {
			beforeEach( async () => {
				github.context.payload = {
					pull_request: {
						number: "250",
						title: "Bump eslint from 4.19.1 to 4.19.4",
						user: {
							login: DEPENDABOT_LOGIN
						},
						html_url: "PULL_REQUEST_URL"
					}
				};
				createCard.returns( "32423423" );
				await action();
			} );

			it( "should get leankit api", () => {
				apiFactory.should.be.calledOnce.and.calledWith( "https://acme.leankit.com", "API_TOKEN" );
			} );

			it( "should get the board", () => { 
				getBoard.should.be.calledOnce.and.calledWith( "1234" );
			} );
			
			it( "should set failed", () => {
				setFailed.should.be.calledOnce.and.calledWith( "Expected to find a lane matching 'INVALID' on board '1234");
			} );

			it( "should not attempt to create a card", () => { 
				createCard.should.not.be.called();
			} );
			
		} );

	} );

	describe( "when 'ready to merge' lane is invalid", () => {
		beforeEach( () => { 
			init();
			getBoard.resolves({
				lanes: [
					{
						id: "1",
						name: "one"
					},
					{
						id: "456",
						name: "READY TO REVIEW"
					},
					{
						id: "789",
						name: "Ready to Merge"
					},
					{
						id: "987",
						name: "Ready to Merge"
					}
				]
			} );
			getInput.onCall( 2 ).returns( "456" );
			getInput.onCall( 3 ).returns( "INVALID" );
		} );
		
		describe( "with a minor version bump", () => {
			beforeEach( async () => {
				github.context.payload = {
					pull_request: {
						number: "250",
						title: "Bump eslint from 4.19.1 to 4.19.4",
						user: {
							login: DEPENDABOT_LOGIN
						},
						html_url: "PULL_REQUEST_URL"
					}
				};
				createCard.returns( "32423423" );
				await action();
			} );

			it( "should get leankit api", () => {
				apiFactory.should.be.calledOnce.and.calledWith( "https://acme.leankit.com", "API_TOKEN" );
			} );

			it( "should get the board", () => { 
				getBoard.should.be.calledOnce.and.calledWith( "1234" );
			} );
			
			it( "should set failed", () => {
				setFailed.should.be.calledOnce.and.calledWith( "Expected to find a lane matching 'INVALID' on board '1234");
			} );

			it( "should not attempt to create a card", () => { 
				createCard.should.not.be.called();
			} );
			
		} );

	} );
} );
