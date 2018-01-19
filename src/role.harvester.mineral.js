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
            var source = creep.pos.findClosestByPath(FIND_MINERALS);
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                const path = creep.room.findPath(creep.pos, source.pos, pathFlags);
                if (path.length > 0) {
                    creep.move(path[0].direction);
                } else {
                    creep.say('Lost');
                }
            }
        }
        if (creep.memory.harvesting) {
            harvestSources();
        } else {
            // Start by filling extensions and spawns
            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) < structure.storeCapacity;
                }
            });

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