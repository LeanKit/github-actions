"use strict";

const { getInput, setOutput, setFailed } = require( "@actions/core" );
const github = require( "@actions/github" );
const { isNaN } = require( "lodash" );
const leankitApiFactory = require( "./api/leankit" );

const DEPENDABOT_LOGIN = "dependabot";

function validateParams( params ) {
	const values = [];
	for ( const param of params ) {
		const value = getInput( param );
		if ( !value ) {
			throw new Error( `Expected '${ param }' action parameter` );
		}
		values.push( value );
	}
	return values;
}

( async () => { // eslint-disable-line max-statements
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

	const { number, title, html_url: url, user: { login } } = github.context.payload.pull_request;

	const titleMatch = /^.+from (.*) to (.*)/.exec( title );
	if ( !titleMatch || !login.includes( DEPENDABOT_LOGIN ) ) {
		setOutput( "message", `Ignoring PR #${ number } '${ title }' from ${ login }` );
		return;
	}
	const [ , oldVersion, newVersion ] = titleMatch;
	const [ oldMajorVersion ] = oldVersion.split( "." );
	const [ newMajorVersion ] = newVersion.split( "." );
	const needsDevReview = newMajorVersion !== oldMajorVersion;
	const typeId = getInput( "type-id" );

	const { getBoard, createCard } = leankitApiFactory( baseUrl, apiToken );

	let reviewLaneId = reviewLaneIdOrTitle;
	let readyLaneId = readyToMergeLaneIdOrTitle;

	if ( isNaN( Number( reviewLaneIdOrTitle ) ) || isNaN( Number( readyToMergeLaneIdOrTitle ) ) ) {
		const board = await getBoard( boardId );

		const reviewLane = board.lanes.find( l => l.id === reviewLaneIdOrTitle || l.name.toLowerCase() === reviewLaneIdOrTitle.toLowerCase() );
		if ( !reviewLane ) {
			throw new Error( `Expected to find a lane matching '${ reviewLaneIdOrTitle }' on board '${ boardId }` );
		}

		const readyLane = board.lanes.find( l => l.id === readyToMergeLaneIdOrTitle || l.name.toLowerCase() === readyToMergeLaneIdOrTitle.toLowerCase() );
		if ( !readyLane ) {
			throw new Error( `Expected to find a lane matching '${ readyToMergeLaneIdOrTitle }' on board '${ boardId }` );
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

	setOutput( "created-card-id", id );
} )().catch( ex => {
	setFailed( ex.message );
} );
