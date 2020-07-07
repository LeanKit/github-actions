"use strict";

const core = require( "@actions/core" );
const github = require( "@actions/github" );
const { isNaN } = require( "lodash" );
const leankitApiFactory = require( "./api/leankit" );

function validateParams( params ) {
	const values = [];
	for (const param of params) {
		const value = core.getInput( param );
		if( !value ) {
			throw new Error( `Expected '${ param }' action parameter` );
		}
		values.push( value );
	}
	return values;
}

const action = async ( {
	baseUrl,
	boardId,
	apiToken,
	reviewLaneIdOrTitle,
	readyToMergeLaneIdOrTitle,
	needsDevReview
} ) => {
	const { number, title } = github.context.payload.pull_request;
	const { getBoard, createCard } = leankitApiFactory( baseUrl, apiToken );

	let reviewLaneId = reviewLaneIdOrTitle;
	let readyLaneId = readyToMergeLaneIdOrTitle;

	if ( isNaN( Number( reviewLaneIdOrTitle ) ) || isNaN( Number( readyToMergeLaneIdOrTitle ) ) ) {
		const board = await getBoard( boardId );
		const reviewLane = board.lanes.find( l => l.title === reviewLaneIdOrTitle );
		if ( !reviewLane ) {
			throw new Error( `Expected to find a lane matching '${ reviewLaneIdOrTitle }' on board '${ boardId }` );
		}

		const readyLane = board.lanes.find( l => l.title === readyToMergeLaneIdOrTitle );
		if ( !readyLane ) {
			throw new Error( `Expected to find a lane matching '${ readyToMergeLaneIdOrTitle }' on board '${ boardId }` );
		}

		reviewLaneId = reviewLane.id;
		readyLaneId = readyLane.id;
	}

	// actions: reopened,
	console.log( "payload", JSON.stringify( github.context.payload, null, 2 ) );

	let laneId = needsDevReview ? reviewLaneId : readyLaneId;

	const id = await createCard( {
		title,
		laneId
	} );

	core.setOutput( "result", {
		createdCardId: id
	} );
};

const [
	leankitBoardUrl,
	apiToken,
	reviewLaneIdOrTitle,
	readyToMergeLaneIdOrTitle
] = validateParams( [ "leankit-board-url", "api-token", "review-lane", "ready-to-merge-lane" ] );

const match = /^(https:.+)\/board\/([0-9]+)/i.exec( leankitBoardUrl );
if( !match ) {
	throw new Error( "Expected a url for 'leankit-board-url' action parameter" );
}
const [ , baseUrl, boardId ] = match;

if( !github.context.payload.pull_request ) {
	throw new Error( "This action may be triggered by a pull_request only." );
}

const { number, title, user: { login } } = github.context.payload.pull_request;
console.log( `Checking PR#${ number }: '${ title }' from ${ login }` );

const titleMatch = /^.+from (.*) to (.*)/.exec( title );
if( !titleMatch || !login.includes( "dependabot" ) ) {
	core.setOutput( "result", { message: `ignoring PR #${ number } '${ title }' from ${ login }` } );
	return;
}

const [ , oldVersion, newVersion ] = titleMatch;
const [ oldMajorVersion ] = oldVersion.split( "." );
const [ newMajorVersion ] = newVersion.split( "." );
const needsDevReview = newMajorVersion !== oldMajorVersion;

try{
	action( {
		baseUrl,
		boardId,
		apiToken,
		reviewLaneIdOrTitle,
		readyToMergeLaneIdOrTitle,
		needsDevReview
	} );
} catch ( ex ) {
	console.log( "ex.message:", ex.message );
	throw ex;
}

