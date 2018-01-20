//var roleUpgrader = require('./role.upgrader');

const pathFlags = {
    //ignoreCreeps: true,
    ignoreRoads: false
};

var roleHarvester = {

    /** @param {Creep} creep **/
    run(creep) {

        if (!creep.memory.harvesting && _.sum(creep.carry) === 0) {
            creep.memory.harvesting = true;
            creep.say('harvesting');
        }

        if (creep.memory.harvesting && _.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.harvesting = false;
            creep.say('transfering');
        }

        function harvestSources() {
            let target;
            // TODO!!!! Hardcoded resource
            const containers = creep.room.find(FIND_STRUCTURES, structure => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ZYNTHIUM] > 0);
            if (containers.length > 0) {
                // Harvest from the containers
                target = creep.pos.findClosestByPath(containers);
                if (creep.withdraw(target) == ERR_NOT_IN_RANGE) {
                    const path = creep.room.findPath(creep.pos, target.pos, pathFlags);
                    if (path.length > 0) {
                        creep.move(path[0].direction);
                    } else {
                        creep.say('Lost');
                    }
                }
            } else {
                target = creep.pos.findClosestByPath(FIND_MINERALS); // I feel like this needs to be determined by need, not distance.
                if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                    const path = creep.room.findPath(creep.pos, target.pos, pathFlags);
                    if (path.length > 0) {
                        creep.move(path[0].direction);
                    } else {
                        creep.say('Lost');
                    }
                }
            }
        }
        if (creep.memory.harvesting) {
            harvestSources();
        } else {
            // Start by filling extensions and spawns
            const storages = creep.room.find(FIND_STRUCTURES, structure => structure.structureType == STRUCTURE_STORAGE);
            let target;
            if (storages.length > 0) {
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, structure => structure.structureType == STRUCTURE_STORAGE && _.sum(structure.store) < structure.storeCapacity);
            } else {
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, structure => structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) < structure.storeCapacity / 2); // fill half way?
            }

            if (target) {
                // TODO!!!! Hardcoded resource
                if (creep.transfer(target, RESOURCE_ZYNTHIUM) == ERR_NOT_IN_RANGE) {
                    //creep.pos.findPathTo
                    const path = creep.room.findPath(creep.pos, target.pos, pathFlags);
                    if (path.length > 0) {
                        creep.move(path[0].direction);
                    } else {
                        creep.say('Lost');
                    }
                    //Eventually, let's try to reuse a path!
                    //creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {
                //upgrade
                creep.say('NoTarget');
            }
        }
    }
};

module.exports = roleHarvester;