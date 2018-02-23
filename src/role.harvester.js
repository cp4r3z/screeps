var roleUpgrader = require('./role.upgrader');

// Get the room status from memory
const roomMemory = Memory.rooms[spawn.room.name];

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

        function pickupDroppedEnergy() {
            const targets = creep.room.find(FIND_DROPPED_RESOURCES, { filter: resource => resource.resourceType == RESOURCE_ENERGY });
            if (targets.length) {
                const target = creep.pos.findClosestByPath(targets);
                if (creep.pickup(target) == ERR_NOT_IN_RANGE) {
                    const path = creep.room.findPath(creep.pos, target.pos, pathFlags);
                    if (path.length > 0) {
                        creep.move(path[0].direction);
                    } else {
                        creep.say('Lost');
                    }
                }

            }
            return targets.length > 0;
        }

        function harvestSources() {
            let source;

            function setNewSource() {
                source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                creep.memory.sourceId = source.id;
            }
            
            if (creep.memory.sourceId) {
                source = Game.getObjectById(creep.memory.sourceId);
                if (source.energy === 0) setNewSource();
            } else setNewSource();

            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                /*
                const path = creep.room.findPath(creep.pos, source.pos, pathFlags);
                if (path.length > 0) {
                    creep.move(path[0].direction);
                } else {
                    creep.say('Lost');
                }
                */
                //http://docs.screeps.com/api/#Creep.moveTo
                const retVal = creep.moveTo(source);
                if (retVal != OK) {
                    console.log(`creep ${creep.name} | moveTo err: ${retVal}`);
                }
            }
        }

        if (creep.memory.harvesting) {
            if (!pickupDroppedEnergy()) {
                // Check to see if there are active sources
                if (roomMemory.areActiveSources) {
                    harvestSources();
                }
            }
        } else {
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
                            (structure.structureType == STRUCTURE_TERMINAL && structure.store[RESOURCE_ENERGY] < 3000) || // I have no idea
                            (structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) < structure.storeCapacity);
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
            } else {
                //upgrade
                creep.say('upppgrade');
                roleUpgrader.run(creep);
            }
        }
    }
};

module.exports = roleHarvester;