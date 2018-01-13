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
            //const roadNodes = [].concat(Game.spawns['Spawn1'].room.find(FIND_MY_SPAWNS),);

            function buildRoad(pos1, pos2) {
                let path = Game.spawns['Spawn1'].room.findPath(pos1, pos2, {
                    ignoreCreeps: true
                });

                for (let pathPos of path) {
                    //create construction site (road)
                    const sites = Game.spawns['Spawn1'].room.getPositionAt(pathPos.x, pathPos.y).lookFor(LOOK_CONSTRUCTION_SITES);
                    if (sites.length === 0) {
                        Game.spawns['Spawn1'].room.getPositionAt(pathPos.x, pathPos.y).createConstructionSite(STRUCTURE_ROAD);
                        //console.log(`Making a construction site: [ROAD] @ ${pathPos.x},${pathPos.y}`);
                    }
                }
            }

            if (creep.room.name != creep.memory.dest) {
                // exit to the room specified in dest
                const route = Game.map.findRoute(creep.room, creep.memory.dest);
                if (route.length > 0) {
                    //console.log('Now heading to room ' + route[0].room);
                    const exit = creep.pos.findClosestByRange(route[0].exit);
                    creep.moveTo(exit);
                }
            } else {
                //console.log('hey this isn't owned)
                // BUILD
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
                                buildRoad(Game.spawns['Spawn1'].pos, source.pos);
                                buildRoad(Game.spawns['Spawn1'].room.controller.pos, source.pos);
                            }
                */
                //var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                const target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                if (target) {
                    if (creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                        //console.log(`Moving to construction site.`);
                    }
                } else {
                    // Repair
                    let targets = creep.room.find(FIND_STRUCTURES, {
                        filter: object => object.hits < object.hitsMax
                    });

                    if (targets.length > 0) {
                        targets = targets.sort((a, b) => a.hits - b.hits);
                        if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets[0]);
                        }
                    } else {
                        //Nothing to do nowhere to go? Go harvest something.
                        creep.say('harrrvest');
                        roleHarvester.run(creep);
                    }
                }

            }
        } else {
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