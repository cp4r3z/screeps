var roleUpgrader = require('./role.upgrader');

const pathFlags = {
    //ignoreCreeps: true,
    ignoreRoads: false
};

var roleHarvester = {

    /** @param {Creep} creep **/
    run(creep) {

        if (!creep.memory.harvesting && creep.carry.energy === 0) {
            creep.memory.harvesting = true;
            creep.say('harvesting');
        }

        if (creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
            creep.memory.harvesting = false;
            creep.say('transfering');
        }

        if (creep.memory.harvesting) {
            var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                const path = creep.room.findPath(creep.pos, source.pos, pathFlags);
                if (path.length > 0) {
                    // Sure, this is ugly. And as it turns out, pointless.
                    if (path.length<3){
                        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                    } else {
                        creep.move(path[0].direction);
                    }
                    //creep.move(path[0].direction);
                }
                //creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
        else {
            // Start by filling extensions and spawns
            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                }
            });

            // Then, if that's all done, fill other stuff
            if (!target) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity) ||
                            (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] < structure.storeCapacity);
                    }
                });
            }
            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
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
            }
            else {
                //upgrade
                creep.say('upppgrade');
                roleUpgrader.run(creep);
            }
        }
    }
};

module.exports = roleHarvester;
