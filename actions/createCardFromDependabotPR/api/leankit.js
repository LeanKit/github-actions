const { post } = require( "got" );

module.exports = ( _baseUrl, _apiToken ) => {
const baseUrl = _baseUrl;
const Authorization = `Bearer ${ _apiToken }`;


    return {
        createCard: async card => {
            console.log( `create card '${ card.title }' in lane '${ card.laneId }` );
            const { id } = await post( `${ baseUrl }/io/card`, {
                json: card,
                headers: {
                    Authorization
                }
            } );
            return id;
        },
        getBoard: id => {
            console.log( `get board id '${ id }'` );
        }
    }
}


// const { hostnameExists } = await post( `https://${ config.signup.hostnameLookupAuthorityHost }/io/hostname/lookup`, {
//     json: { hostname: changes.hostname }
// } ).json();

// const options = {
//     json: {
//         title: "Welcome To LeanKit",
//         templateId: welcomeBoardTemplateId,
//         includeCards: true
//     },
//     headers: {
//         Authorization: `JWT ${ getJwt( userId ) }`
//     }
