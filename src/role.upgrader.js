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
        } else {
            // find nearest source (with energy)
            // use findPath to sort

            // this shit needs to be a module or something.
            let sources =
                Game.spawns['Spawn1'].room.find(FIND_SOURCES_ACTIVE)

            // Okay, I'm not sure you can harvest from extensions! Ha! Maybe we'll have to drop energy.
            // Oh, SO, there's thie "withdraw" command that we should look into. Again, this needs to be a util.
            // Ok, trying to use containers instead. This should be good.

            .concat(
                Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] > 0;
                    }
                })
            );

            //console.log(sources);

            // ok, this is not efficient anymore. use the built in method instead
            const closestSource = sources.sort((sourceA, sourceB) => {
                return creep.room.findPath(creep.pos, sourceA.pos).length - creep.room.findPath(creep.pos, sourceB.pos).length;
            })[0];
            //console.log(closestSource);
            if (closestSource.structureType == STRUCTURE_CONTAINER) {
                if (creep.withdraw(closestSource, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestSource, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {
                if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
                    //console.log(`role.upgrader: ${creep.name} moving to ${closestSource}.`)
                    creep.moveTo(closestSource, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }


        }
    }
};

module.exports = roleUpgrader;