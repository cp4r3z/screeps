module.exports = (tower) => {
    if (tower.energy > 0) {
        // Get the room status from memory
        const roomStatus = Memory.rooms[tower.room.name];

        if (roomStatus.isUnderAttack) {
            const closestHostile = tower.pos.findClosestByRange(roomStatus.hostiles);
            tower.attack(closestHostile);
        } else {
            if (tower.energy > 100) {
                const closestDamagedStructure = tower.pos.findClosestByRange(roomStatus.structuresNeedingRepair);
                if (closestDamagedStructure) {
                    tower.repair(closestDamagedStructure);
                }
            }
        }
    }
};