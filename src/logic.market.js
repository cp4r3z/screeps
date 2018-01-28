logicTerminal = require('./logic.terminal');
module.exports = {
    sales(roomName) {
        if (!Game.rooms[roomName].terminal) return false;
        
        //eventually, we can dynamically create / modify orders... specifically extend existing
        // for now, create an order if there's no active order and the resources is > 100
        // we also need energy right?

        const resourceThreshold = 1000;
        //CPU - getAllOrders takes a lot, I guess.
        const myOrders = Game.market.getAllOrders(order => order.type == ORDER_SELL && order.roomName == roomName);
        const inactiveOrders = _.filter(Game.market.orders,{'active':false,'roomName':'E13N46'});
        inactiveOrders.map(order=>console.log(`${order.id}: ${order.resourceType}`));
        //Game.market.createOrder(ORDER_SELL, RESOURCE_ZYNTHIUM, .7, 1000, 'E13N46');
        const orderIds = {
            sell:{
                Z: '5a6d3a3ef5f6d20591fcdb27'
            },
            buy:{

            }
        }
        //const inactiveOrders = _filter(Game.market.orders,{'active':false,'roomName':'E13N46'});
        //inactiveOrders.map(order=>{Game.market.cancelOrder(order.id);});
        if (myOrders.length > 1) {
            //console.log(`market: There are too many orders!`);
        } else if (myOrders.length === 0) {
            // Create a new order
            //const terminal = Game.rooms[roomName].find(FIND_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_TERMINAL });
            const terminal = Game.rooms[roomName].terminal
            //console.log(terminal);
            //console.log(terminal.storeCapacity)
            const hasEnergy = terminal.store[RESOURCE_ENERGY] > 3000;
            //TODO: Hardcoded resource!!!
            const hasResource = terminal.store[RESOURCE_ZYNTHIUM] > resourceThreshold;

            if (hasEnergy && hasResource) {
                console.log(`market: Fix ordering!`);
                //TODO: Hardcoded resource!!!
                // Figure out the "going rate"
                const price = 0.7;
                const totalAmount = resourceThreshold;
                const marketResult = "fix market";//Game.market.createOrder(ORDER_SELL, RESOURCE_ZYNTHIUM, price, totalAmount, roomName);
            }

        } else {
            // There's already an order. Extend it maybe?
        }

    }
}