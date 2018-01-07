const roleScout = {
    run(creep) {
        if (creep.room.controller.my) {
            // exit to the room specified in dest
            if (creep.memory.dest) {
                const route = Game.map.findRoute(creep.room, creep.memory.dest);
                if (route.length > 0) {
                    //console.log('Now heading to room ' + route[0].room);
                    const exit = creep.pos.findClosestByRange(route[0].exit);
                    creep.moveTo(exit);
                }
            } else {
                creep.say(`I'm lost`);
            }
        }
        else {
            //console.log('hey this isn't owned)
            if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
    }
}

module.exports = roleScout;
