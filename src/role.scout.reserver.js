const roleScout = {
    run(creep) {
        if (creep.room.name == creep.memory.dest) {
            if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        } else {
            // exit to the room specified in dest
            const route = Game.map.findRoute(creep.room, creep.memory.dest);
            if (route.length > 0) {
                //console.log('Now heading to room ' + route[0].room);
                const exit = creep.pos.findClosestByRange(route[0].exit);
                creep.moveTo(exit);
            }
        }
    }
}

module.exports = roleScout;