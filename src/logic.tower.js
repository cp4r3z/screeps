module.exports = (tower) => {
    // Get the room status from memory
    const roomStatus = Memory.rooms[tower.room.name].status;

    if (roomStatus.isUnderAttack) {
        const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        tower.attack(closestHostile);
    } else {
        const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 1e5 // Um, this should probably be thought about.
        });
        if (closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }
    }
};