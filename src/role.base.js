const utils = require('./utils');

module.exports = (creep, roomMemory) => {
    return {
        test() {
            console.log('hi');
            console.log(this.name); //assume this is the creep context?
        },
        getEnergy() {
            if (roomMemory.storageWithEnergy.length > 0) {
                // Take energy from storage units first
                const storage = creep.pos.findClosestByPath(roomMemory.storageWithEnergy);
                if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    utils.movement.toDest(creep, storage);
                }
            } else {
                // Otherwise, harvest the energy from the nearest source
                const closestSource = creep.pos.findClosestByPath(roomMemory.sources.active);
                if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
                    utils.movement.toDest(creep, closestSource);
                }
            }
            // Get energy from storage or, failing that, harvest.
        },
        utils
    }
};