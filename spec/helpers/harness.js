const { requireFromRoot, sinon } = testHelpers;
const hippie = require( "./hippie" );
const http = require( "http" );
const httpStatus = require( "http-status" );
const jwt = require( "jsonwebtoken" );
const merge = require( "lodash.merge" );
const redis = require( "./mock-redis" );
const sqlTestSetup = require( "@lk/core-sql-test-setup" );
const serverFactory = requireFromRoot( "src/server" );

const config = requireFromRoot( "spec/config.default" );
try {
	merge( config, requireFromRoot( "spec/config.local" ) );
} catch ( e ) {} // eslint-disable-line no-empty

const { secret, issuer, audience } = config.auth.jwt;

const log = require( "bunyan-debug-filter" )( {
	name: config.name,
	level: config.logging.level,
	pattern: process.env.DEBUG
} );

const originalSqlConfig = Object.assign( {}, config.sql );
config.sql.database = config.testDatabase;

const sql = requireFromRoot( "src/setup/sql" )( config );

const proxy = requireFromRoot( "src/proxy" )( config );

const data = requireFromRoot( "src/data" )( { config, sql, redis, log } );
const securityPrincipal = requireFromRoot( "src/data/security-principal" )( { sql, lockoutPolicy: config.auth.lockoutPolicy, redis, log, principalCacheTtl: config.principalCacheTtl } );

const jwtModule = requireFromRoot( "src/jwt" )( config );
const jwtRedisUtils = requireFromRoot( "src/utils/jwtRedisUtils" )( { config, redis } );
const authenticate = requireFromRoot( "src/authenticate" )( { config: config.auth, securityPrincipal, redis, jwtRedisUtils } );

let _db, _authServer, _mockService;
function getDb() {
	if ( !_db ) {
		_db = sqlTestSetup( originalSqlConfig, config.testDatabase );
	}
	return _db;
}

function getAuthServer() {
	const clock = sinon.useFakeTimers( config.startupTime );
	if ( !_authServer ) {
		_authServer = serverFactory(
			{
				config,
				data,
				log,
				jwt: jwtModule,
				jwtRedisUtils,
				proxy,
				redis,
				authenticate
			}
		);
	}
	clock.restore();

	return _authServer;
}

function getMockService() {
	if ( !_mockService ) {
		_mockService = http.createServer( ( req, res ) => {
			const parts = ( req.headers.authorization || "" ).split( " " ) || [];
			const [ tokenType, token ] = parts;
			if ( parts.length !== 2 || tokenType !== "JWT" ) {
				throw new Error( "Invalid authorization header sent to backend service by auth gateway." );
			}

			const auth = jwt.verify( token, secret, { issuer, audience } );

			const body = [];
			req.on( "data", chunk => body.push( chunk ) );
			req.on( "end", () => {
				res.statusCode = auth.principal ? httpStatus.OK : httpStatus.UNAUTHORIZED;
				res.setHeader( "Content-Type", "application/json" );
				res.setHeader( "X-Fake-Response-Header", "header value" );
				res.end( JSON.stringify( {
					auth,
					proxied: {
						method: req.method,
						url: req.url,
						headers: req.headers,
						body: Buffer.concat( body ).toString()
					}
				} ) );
			} );
		} );
	}
	_mockService.listen( config.mockService.port );
	return _mockService;
}

module.exports = {
	setup( scenario = {} ) {
		getAuthServer();
		getMockService();

		if ( scenario.tables ) {
			if ( scenario.seedFolder ) {
				scenario.seedFolder = `../integration/${ scenario.seedFolder }`;
			}
			return getDb().buildTest( scenario );
		}

		return null;
	},
	redis() {
		return redis;
	},
	sql() {
		return sql;
	},
	teardown() {
		_mockService.close();
	},
	request( host = "nachosthecat.loltest.com" ) {
		return hippie( getAuthServer() ).header( "host", host );
	}
};
