var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if (creep.memory.upgrading && creep.carry.energy === 0) {
            creep.memory.upgrading = false;
            creep.say('harvesting');
        }
        if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
            creep.say('upgrading');
        }

        if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
            }
        }
        else {
            // find nearest source (with energy)
            // use findPath to sort

            // this shit needs to be a module or something.
            let sources =
                Game.spawns['Spawn1'].room.find(FIND_SOURCES_ACTIVE).concat(
                    Game.spawns['Spawn1'].room.find(FIND_MY_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION) && structure.energy > 0; //||
                            //structure.structureType == STRUCTURE_CONTAINER);
                        }
                    })
                );
            //console.log(sources);
            const closestSource = sources.sort((sourceA, sourceB) => {
                return creep.room.findPath(creep.pos, sourceA.pos).length - creep.room.findPath(creep.pos, sourceB.pos).length;
            })[0];
            //console.log(closestSource);
            if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
                //console.log(`role.upgrader: ${creep.name} moving to ${closestSource}.`)
                creep.moveTo(closestSource, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
    }
};

module.exports = roleUpgrader;
