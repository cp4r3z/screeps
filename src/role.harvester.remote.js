// These creeps require a dest property and a home property, which are room hashes.

module.exports = {
    run(creep) {

        // Get the room status from memory
        const roomMemory = Memory.rooms[creep.room.name];

        // Load the base creep module
        const base = require('./role.base')(creep, roomMemory);

        if (!creep.memory.harvesting && creep.carry.energy === 0) {
            creep.memory.harvesting = true;
        }

        if (creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
            creep.memory.harvesting = false;
        }

        if (creep.memory.harvesting) {
            if (creep.room.name == creep.memory.dest) {
                // Creep is in the remote room. Harvest!
                if (roomMemory.sources.active.are) {
                    const source = roomMemory.sources.active[0];
                    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        base.utils.movement.toDest(creep, source, 50);
                    }
                    //creep.memory.sourceId = source.id;
                }
            } else {
                // The creep is in some other room.
                const target = new RoomPosition(24, 24, creep.memory.dest);
                base.utils.movement.toDest(creep, target, 50);
            }
        } else {
            // Transfer energy to home room.
            // We can assume that we have creeps in the home room. I think.
            const target = Memory.rooms[creep.memory.home].storageWithCapacity[0]; // What happens if there's no capacity?
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                base.utils.movement.toDest(creep, target, 50);
            }
        }
    }
};