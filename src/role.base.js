module.exports = (creep, roomMemory) => {
    return {
        test() {
            console.log('hi');
            console.log(this.name); //assume this is the creep context?
        },
        goGetEnergy() {
            if (roomMemory.storageWithEnergy.length > 0) {
                // Take energy from storage units first
                const storage = creep.pos.findClosestByPath(roomMemory.storageWithEnergy);
                if (creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    movement.toDest(creep, storage);
                }
            } else {
                // Otherwise, harvest the energy from the nearest source
                const closestSource = creep.pos.findClosestByPath(roomMemory.sourcesActive);
                if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
                    movement.toDest(creep, closestSource);
                }
            }
            // Get energy from storage or, failing that, harvest.
        }
    }
};