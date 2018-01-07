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
            const sources = [].concat(
                Game.spawns['Spawn1'].room.find(FIND_SOURCES_ACTIVE),
                Game.spawns['Spawn1'].room.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_EXTENSION; //||
                        //structure.structureType == STRUCTURE_CONTAINER);
                    }
                })
            );

            var closestSource = sources.sort((sourceA, sourceB) => creep.room.findPath(creep.pos, sourceA.pos) - creep.room.findPath(creep.pos, sourceB.pos))[0];

            if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
                //console.log(`role.upgrader: ${creep.name} moving to ${closestSource}.`)
                creep.moveTo(closestSource, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
    }
};

module.exports = roleUpgrader;
