//var roleUpgrader = require('./role.upgrader');

const pathFlags = {
    //ignoreCreeps: true,
    ignoreRoads: false
};

var roleHarvester = {

    /** @param {Creep} creep **/
    run(creep) {

        // Get the room status from memory
        const roomMemory = Memory.rooms[creep.room.name];

        // Load the base creep module
        const base = require('./role.base')(creep, roomMemory);

        if (!creep.memory.harvesting && _.sum(creep.carry) === 0) {
            creep.memory.harvesting = true;
            creep.say('harvesting');
        }

        if (creep.memory.harvesting && _.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.harvesting = false;
            creep.say('transfering');
        }

        function pickupDroppedMinerals() {
            
            const targets = creep.room.find(FIND_DROPPED_RESOURCES, { filter: resource => resource.resourceType !== RESOURCE_ENERGY });
            if (targets.length) {
                const target = creep.pos.findClosestByPath(targets);
                if (creep.pickup(target) == ERR_NOT_IN_RANGE) {
                    base.utils.movement.toDest(creep, target);
                }

            }
            return targets.length > 0;
        }

        function harvestSources() {
            let target;
            // TODO!!!! Hardcoded resource
            const containers = creep.room.find(FIND_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ZYNTHIUM] > 0 });
            if (containers.length > 0) {
                // Harvest from the containers
                target = creep.pos.findClosestByPath(containers);
                // TODO!!!! Hardcoded resource
                if (creep.withdraw(target, RESOURCE_ZYNTHIUM) == ERR_NOT_IN_RANGE) {
                    base.utils.movement.toDest(creep, target);
                }
            } else {
                target = roomMemory.minerals[0]; // Assuming there's only one mineral available...
                if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                    base.utils.movement.toDest(creep, target, 20);
                }
            }
        }
        if (creep.memory.harvesting) {
            if (!pickupDroppedMinerals()) {
                if (roomMemory.hasMineral) harvestSources();
            }
        } else {
            let target;

            //TODO: Figure out better logic for this... it's getting messy.

            // Fill terminals that aren't full.
            if (roomMemory.areTerminalsNotAtCapacity) {
                target = roomMemory.terminals.withCapacity[0];
            } else {
                // Fill extensions and spawns
                const storages = roomMemory.storageOnly;

                if (storages.length > 0) {
                    target = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_STORAGE && _.sum(structure.store) < structure.storeCapacity });
                } else {
                    target = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) < structure.storeCapacity / 2 }); // fill half way?
                }
            }

            if (target) {
                _.each(creep.carry, (amount, cargo) => {
                    if (creep.transfer(target, cargo) == ERR_NOT_IN_RANGE) {
                        base.utils.movement.toDest(creep, target, 20);
                        //exit the each?
                    }
                });
            } else {
                //upgrade
                creep.say('NoTarget');
            }
        }
    }
};

module.exports = roleHarvester;