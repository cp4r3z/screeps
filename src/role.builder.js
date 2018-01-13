var roleHarvester = require('./role.harvester');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

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

            const sources = [].concat(
                creep.room.find(FIND_SOURCES_ACTIVE),
                creep.room.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_CONTAINER);
                    }
                })
            );
            // This gets out of control.
            /*
                        for (let source of sources) {
                            buildRoad(creep.pos, source.pos);
                            buildRoad(creep.room.controller.pos, source.pos);
                        }
            */
            //var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            const target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (target) {
                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                    //console.log(`Moving to construction site.`);
                }
            }
            else {
                // Repair
                let targets = creep.room.find(FIND_STRUCTURES, {
                    filter: object => object.hits < object.hitsMax
                });

                if (targets.length > 0) {
                    targets = targets.sort((a, b) => a.hits - b.hits);
                    if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                }
                else {
                    //Nothing to do nowhere to go? Go harvest something.
                    creep.say('harrrvest');
                    roleHarvester.run(creep);
                }
            }
        }
        else {
            // find nearest source (with energy)
            // use findPath to sort
            // !!! There's a native method for this.
            var sources = creep.room.find(FIND_SOURCES, {
                filter: (source) => {
                    return source.energy > 0;
                }
            });
            var closestSource = sources.sort((sourceA, sourceB) => creep.room.findPath(creep.pos, sourceA.pos) - creep.room.findPath(creep.pos, sourceB.pos))[0];

            if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
                //console.log(`role.upgrader: ${creep.name} moving to ${closestSource}.`)
                creep.moveTo(closestSource, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
    }
};

module.exports = roleBuilder;
