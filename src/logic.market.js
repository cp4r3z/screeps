logicTerminal = require('./logic.terminal');
module.exports = () => {

    // Do we want this? Maybe store it in memory or the config? Maybe we don't need it!
    const orders = {
        sell: [{
                resource: RESOURCE_ZYNTHIUM,
                id: '5a6d3a3ef5f6d20591fcdb27',
                price: .75
            },
            {
                resource: RESOURCE_KEANIUM,
                id: '5aad3c647b053203bae7ea05',
                price: .45
            }
        ],
        buy: {

        }
    };

    function sales(roomName) {

        //eventually, we can dynamically create / modify orders... specifically extend existing
        // for now, create an order if there's no active order and the resources is > resourceThreshold
        // we also need energy right?

        const resourceThreshold = 1000;

        // console.log(`
        //     Game.rooms[roomName].terminal.cooldown: ${Game.rooms[roomName].terminal.cooldown}
        //     Game.rooms[roomName].terminal.my: ${Game.rooms[roomName].terminal.my}
        // `);

        //CPU - getAllOrders takes a lot, I guess. I don't know if filter uses less CPU, but it gets inactive orders too.
        //const myOrders = Game.market.getAllOrders(order => order.type == ORDER_SELL && order.roomName == roomName);
        const roomOrders = _.filter(Game.market.orders, {
            type: 'sell',
            roomName: roomName
        });

        if (!roomOrders) {
            // This should not happen
            Game.notify('market: Unable to find orders!');
            return false;
        }

        /**
         * Ok, so now iterate over all the _mineral_ resources in the terminal.
         * If the resources are over the threshold, make sure there's an active order.
         * If there isn't an active order, extend an existing inactive order.
         * If there isn't an inactive order, create a new one.
         */

        const terminal = Game.rooms[roomName].terminal;

        //const hasEnergy = terminal.store[RESOURCE_ENERGY] > resourceThreshold; // Maybe this needs to be considered when we have multiple orders active.
        // Math.ceil( amount * ( 1 - Math.exp(-distanceBetweenRooms/30) ) )

        _.each(terminal.store, (amount, resource) => {
            // Escape if the resource is not found in the sell array above.
            if (!_.find(orders.sell, { resource: resource })) return;

            // Escape if there aren't enough of that resource.
            if (terminal.store[resource] < resourceThreshold) return;

            const existingOrders = _.filter(roomOrders, {
                resourceType: resource
            });
            const orderKeys = _.keys(existingOrders);
            if (orderKeys.length == 1) {
                if (existingOrders[orderKeys[0]].active) {
                    //console.log(`market: Already an active order`);
                    // Maybe lower the price after some time?
                } else {
                    //Extend an inactive order
                    const rc = Game.market.extendOrder(existingOrders[orderKeys[0]].id, resourceThreshold); //TODO: // Figure out the "going rate"
                    if (rc === 0) {
                        console.log(`market: Extended order ${existingOrders[orderKeys[0]].id} by ${resourceThreshold} at ${resource.price} credits.`);
                    } else {
                        console.log(`market: Failed to extend order. Error code: ${rc}`);
                    }
                }
            } else {
                if (orderKeys.length > 1) {
                    Game.notify(`market: Multiple orders for ${resource}.`);
                }
                // Maybe we need to create an order...
                const marketResult = "fix market"; //Game.market.createOrder(ORDER_SELL, RESOURCE_ZYNTHIUM, price, totalAmount, roomName);
                console.log(marketResult);
            }
        });

        // Abandoned code

        //Game.market.createOrder(ORDER_SELL, RESOURCE_ZYNTHIUM, .7, 1000, 'E13N46');
        //const inactiveOrders = _filter(Game.market.orders,{'active':false,'roomName':'E13N46'});
        //inactiveOrders.map(order=>{Game.market.cancelOrder(order.id);});

    }

    for (const roomName in Game.rooms) {
        // Only run the logic if there's a terminal.
        if (Game.rooms[roomName].terminal) {
            sales(roomName);
        }
    }

};