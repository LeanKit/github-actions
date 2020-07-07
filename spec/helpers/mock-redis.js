let kv = {};

module.exports = {
	set( key, value ) {
		kv[ key ] = value;
	},
	sadd( key, value ) {
		kv[ key ] = kv[ key ] || new Set();
		kv[ key ].add( value );
	},
	sismember( key, value ) {
		return kv[ key ] && kv[ key ].has( value ) ? 1 : 0;
	},
	smembers( key ) {
		return kv[ key ] ? [ ...kv[ key ] ] : [];
	},
	get( key ) {
		return Promise.resolve( kv[ key ] );
	},
	setup( key, value ) {
		kv[ key ] = value;
	},
	reset() {
		kv = {};
	},
	del( key ) {
		delete kv[ key ];
	},
	expire() {},
	connected: true
};
