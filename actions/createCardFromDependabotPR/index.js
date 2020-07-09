"use strict";

const core = require( "@actions/core" );
const github = require( "@actions/github" );
const { isNaN } = require( "lodash" );
const log = require( "../../utils/logger" );
const leankitApiFactory = require( "./api/leankit" );

const DEPENDABOT_LOGIN = "JohnDMathis";

function validateParams( params ) {
	const values = [];
	for ( const param of params ) {
		const value = core.getInput( param );
		if ( !value ) {
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
	needsDevReview,
	typeId
} ) => {
	const { title, html_url: url } = github.context.payload.pull_request;
	const { getBoard, createCard } = leankitApiFactory( baseUrl, apiToken );

	let reviewLaneId = reviewLaneIdOrTitle;
	let readyLaneId = readyToMergeLaneIdOrTitle;

	if ( isNaN( Number( reviewLaneIdOrTitle ) ) || isNaN( Number( readyToMergeLaneIdOrTitle ) ) ) {
		const board = await getBoard( boardId );
		const reviewLane = board.lanes.find( l => l.id === reviewLaneIdOrTitle || l.title.toLowerCase() === reviewLaneIdOrTitle.toLowerCase() );
		if ( !reviewLane ) {
			core.setFailed( `Expected to find a lane matching '${ reviewLaneIdOrTitle }' on board '${ boardId }` );
			return;
		}

		const readyLane = board.lanes.find( l => l.id === readyToMergeLaneIdOrTitle || l.title.toLowerCase() === readyToMergeLaneIdOrTitle.toLowerCase() );
		if ( !readyLane ) {
			core.setFailed( `Expected to find a lane matching '${ readyToMergeLaneIdOrTitle }' on board '${ boardId }` );
			return;
		}

		reviewLaneId = reviewLane.id;
		readyLaneId = readyLane.id;
	}

	const laneId = needsDevReview ? reviewLaneId : readyLaneId;

	const id = await createCard( {
		boardId,
		title,
		typeId,
		laneId,
		customId: "dependabot",
		externalLink: {
			url,
			label: "PR"
		}
	} );

	core.setOutput( "result", {
		createdCardId: id
	} );
};

try {
	const [
		leankitBoardUrl,
		apiToken,
		reviewLaneIdOrTitle,
		readyToMergeLaneIdOrTitle
	] = validateParams( [ "leankit-board-url", "api-token", "review-lane", "ready-to-merge-lane" ] );

	const match = /^(https:.+)\/board\/([0-9]+)/i.exec( leankitBoardUrl );
	if ( !match ) {
		throw new Error( "Expected a url for 'leankit-board-url' action parameter" );
	}
	const [ , baseUrl, boardId ] = match;

	if ( !github.context.payload.pull_request ) {
		throw new Error( "This action may be triggered by a pull_request only." );
	}

	const { number, title, user: { login } } = github.context.payload.pull_request;
	log( `Checking PR#${ number }: '${ title }' from ${ login }` );

	const titleMatch = /^.+from (.*) to (.*)/.exec( title );
	if ( !titleMatch || !login.includes( DEPENDABOT_LOGIN ) ) {
		const message = `Ignoring PR #${ number } '${ title }' from ${ login }`;
		log( message );
		core.setOutput( "result", message );
	} else {
		const [ , oldVersion, newVersion ] = titleMatch;
		const [ oldMajorVersion ] = oldVersion.split( "." );
		const [ newMajorVersion ] = newVersion.split( "." );
		const needsDevReview = newMajorVersion !== oldMajorVersion;

		action( {
			baseUrl,
			boardId,
			apiToken,
			reviewLaneIdOrTitle,
			readyToMergeLaneIdOrTitle,
			needsDevReview,
			typeId: core.getInput( "type-id" )
		} );
	}
} catch ( ex ) {
	console.log( "ex.message:", ex.message );
	core.setFailed( ex.message );
}

