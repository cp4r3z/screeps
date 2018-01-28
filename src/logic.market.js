logicTerminal = require('./logic.terminal');
module.exports = () => {

    // Do we want this? Maybe store it in memory or the config? Maybe we don't need it!
    const orders = {
        sell: [{
            resource: RESOURCE_ZYNTHIUM,
            id: '5a6d3a3ef5f6d20591fcdb27'
        }],
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

        const hasEnergy = terminal.store[RESOURCE_ENERGY] > resourceThreshold; // Maybe this needs to be considered when we have multiple orders active.
        // Math.ceil( amount * ( 1 - Math.exp(-distanceBetweenRooms/30) ) )

        _.each(terminal.store, resource => {
            if (resource == RESOURCE_ENERGY) {
                return false;
            }
            
            // Determine if the resource is found in the sell array above.
            const shouldSell = _.find(orders.sell, { resource: resource });

            const hasResource = terminal.store[resource] > resourceThreshold;
            if (hasEnergy && hasResource && shouldSell) {
                console.log(`market: Fix ordering!`);
                const price = 0.75; // Figure out the "going rate"
                const totalAmount = resourceThreshold;
                const existingOrder = _.filter(Game.market.orders, {
                    resourceType: resource
                });
                if (existingOrder) {
                    if (existingOrder.active) {
                        //console.log(`market: Already an active order`);
                    } else {
                        //Extend an inactive order
                        const rc = Game.market.extendOrder(existingOrder.id, resourceThreshold);
                        if (rc !== 0) {
                            Game.notify(`market: Failed to extend order`);
                        }
                    }
                } else {
                    // Maybe we need to create an order...
                    const marketResult = "fix market"; //Game.market.createOrder(ORDER_SELL, RESOURCE_ZYNTHIUM, price, totalAmount, roomName);
                    console.log(marketResult);
                }
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