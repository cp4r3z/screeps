var roleUpgrader = require('role.upgrader');

var roleHarvester = {

    /** @param {Creep} creep **/
    run(creep) {
        if (creep.carry.energy === 0) {
            creep.memory.harvesting = true;
        }
        if (creep.memory.harvesting) {
            var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
            // Only once the creep is done harvesting should it transfer to an energy store.
            if (creep.carry.energy == creep.carryCapacity) {
                creep.memory.harvesting = false;
            }
        }
        else {
            const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_CONTAINER ||
                        structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                }
            });

            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
            else {
                //upgrade
                roleUpgrader.run(creep);
            }
        }
    }
};

module.exports = roleHarvester;
