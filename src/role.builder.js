const roleHarvester = require('./role.harvester');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Get the room status from memory
        const roomMemory = Memory.rooms[creep.room.name];

        // Load the base creep module
        const base = require('./role.base')(creep, roomMemory);

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

            // This gets out of control.
            /*
                        for (let source of sources) {
                            buildRoad(creep.pos, source.pos);
                            buildRoad(creep.room.controller.pos, source.pos);
                        }
            */

            if (roomMemory.areConstructionSites) {
                let target = creep.pos.findClosestByPath(roomMemory.constructionSites);
                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    base.utils.movement.toDest(creep, target);
                    //console.log(`Moving to construction site.`);
                }
            } else if (roomMemory.structuresNeedingRepair.length > 0) {
                // Repair
                target = roomMemory.structuresNeedingRepair[0];
                // I think this wastes time. The creep should probably "linger" for awhile before moving on to another target.
                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                    base.utils.movement.toDest(creep, target);
                }
            } else {
                //Nothing to do nowhere to go? Go harvest something.
                creep.say('bored');
                //roleHarvester.run(creep);
            }
        } else {
            base.getEnergy();
        }
    }
};

module.exports = roleBuilder;