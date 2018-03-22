var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.role !== 'upgrader' || creep.memory.role !== 'harvester') return;

        // Get the room status from memory
        const roomMemory = Memory.rooms[creep.room.name];

        // Load the base creep module
        const base = require('./role.base')(creep, roomMemory);

        if (creep.memory.upgrading && creep.carry.energy === 0) {
            creep.memory.upgrading = false;
            creep.say('harvesting');
        }
        if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
            creep.say('upgrading');
        }

        // Figure out if there's ghodium hydride, ghodium acid, or catalyzed ghodium acid laying around.
        // or just go straight for the good stuff. RESOURCE_CATALYZED_GHODIUM_ACID

        if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                base.utils.movement.toDest(creep, creep.room.controller, 20);
            }
        } else {
            base.getEnergy();
        }
    }
};

module.exports = roleUpgrader;