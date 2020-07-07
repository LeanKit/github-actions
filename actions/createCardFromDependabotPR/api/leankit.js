module.exports = () => {
    return {
        createCard: card => {
            console.log( `create card '${ card.title }' in lane '${ card.laneId }` );
        },
        getBoard: id => {
            console.log( `get board id '${ id }'` );
        }
    }
}