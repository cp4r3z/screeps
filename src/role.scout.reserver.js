const roleScout = {
    run(creep) {

        // Get the room status from memory
        const roomMemory = Memory.rooms[creep.room.name];

        // Load the base creep module
        const base = require('./role.base')(creep, roomMemory);

        if (creep.room.name == creep.memory.dest) {
            target = Game.rooms[creep.memory.dest].controller;
            if (creep.reserveController(target) == ERR_NOT_IN_RANGE) {
                base.utils.movement.toDest(creep, target, 50);
            }
        } else {
            target = new RoomPosition(24, 24, creep.memory.dest);
            base.utils.movement.toDest(creep, target, 50);
        }
        
    }
}

module.exports = roleScout;