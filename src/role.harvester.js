const roleUpgrader = require('./role.upgrader');

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
                    base.utils.movement.toDest(creep, target);
                }

            }
            return targets.length > 0;
        }

        function harvestSources() {
            let source;

            function setNewSource() {
                if (roomMemory.areActiveSources) {
                    source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                    creep.memory.sourceId = source.id;
                }
            }

            if (creep.memory.sourceId) {
                source = Game.getObjectById(creep.memory.sourceId);
                if (source.energy === 0) setNewSource();
            } else setNewSource();

            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                base.utils.movement.toDest(creep, source);
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
            let target = creep.pos.findClosestByPath(_.union(
                roomMemory.spawns.needingEnergy,
                roomMemory.extensions.needingEnergy
            ));

            // Then, if that's all done, fill other stuff
            if (!target) target = creep.pos.findClosestByPath(roomMemory.terminals.needingEnergy);
            if (!target) target = creep.pos.findClosestByPath(roomMemory.towers.needingEnergy);
            if (!target) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) < structure.storeCapacity) ||
                            (structure.structureType == STRUCTURE_STORAGE && _.sum(structure.store) < structure.storeCapacity);
                    }
                });
            }
            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    base.utils.movement.toDest(creep, target);
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