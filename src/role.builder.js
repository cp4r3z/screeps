const roleHarvester = require('./role.harvester');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Get the room status from memory
        const roomMemory = Memory.rooms[creep.room.name];

        // Load the base creep module
        const base = require('./role.base')(creep, roomMemory);

        // Repeat Action Ticks
        const repeatInterval = 15;

        if (creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('harvesting');
        }

        if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('building');
        }

        if (creep.memory.building) {
            // Generate Roads from all structures
            // Energy Sources
            // Spawn
            // Controller
            // Containers
            // 
            //const roadNodes = [].concat(creep.room.find(FIND_MY_SPAWNS),);

            function buildRoad(pos1, pos2) {
                let path = creep.room.findPath(pos1, pos2, {
                    ignoreCreeps: true
                });

                for (let pathPos of path) {
                    //create construction site (road)
                    const sites = creep.room.getPositionAt(pathPos.x, pathPos.y).lookFor(LOOK_CONSTRUCTION_SITES);
                    if (sites.length === 0) {
                        creep.room.getPositionAt(pathPos.x, pathPos.y).createConstructionSite(STRUCTURE_ROAD);
                        //console.log(`Making a construction site: [ROAD] @ ${pathPos.x},${pathPos.y}`);
                    }
                }
            }

            const nextStructureNeedingRepair = function() {
                const target = roomMemory.structuresNeedingRepair[0];
                creep.memory.targetID = target.id;
                creep.memory.repeatUntil = Game.time + repeatInterval;
                return target;
            };

            const repairStructures = function() {
                // Choose Target --- I feel like this needs some cleanup.
                if (creep.memory.repeatUntil > Game.time && creep.memory.targetID) {
                    target = Game.getObjectById(creep.memory.targetID);
                    if (!target) {
                        target = nextStructureNeedingRepair();
                    }
                    if (target.hits == target.hitsMax) {
                        target = nextStructureNeedingRepair();
                    }
                } else {
                    target = nextStructureNeedingRepair();
                }

                // Repair
                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                    base.utils.movement.toDest(creep, target);
                }
            };

            // This gets out of control.
            /*
                        for (let source of sources) {
                            buildRoad(creep.pos, source.pos);
                            buildRoad(creep.room.controller.pos, source.pos);
                        }
            */
            let target;
            if (roomMemory.constructionSites.are) {
                // How to make this "repeating" into a function...
                if (creep.memory.repeatUntil > Game.time && creep.memory.targetID) {
                    target = Game.getObjectById(creep.memory.targetID);
                } else {
                    target = creep.pos.findClosestByPath(roomMemory.constructionSites);
                    creep.memory.targetID = target.id;
                    creep.memory.repeatUntil = Game.time + repeatInterval;
                }

                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    base.utils.movement.toDest(creep, target);
                    //console.log(`Moving to construction site.`);
                }
            } else if (roomMemory.towers.needingEnergy.length > 0) {
                let target = creep.pos.findClosestByPath(roomMemory.towers.needingEnergy);
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    base.utils.movement.toDest(creep, target);
                }
            } else if (roomMemory.structuresNeedingRepair.length > 0) {
                repairStructures();
            } else {
                //Nothing to do nowhere to go? Go harvest something.
                creep.say('bored');
                roleHarvester.run(creep); // This causes the builder to "bounce" between depositing into storage and taking out. Rethink!
            }
        } else {
            base.getEnergy();
        }
    }
};

module.exports = roleBuilder;