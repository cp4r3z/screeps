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

        // Figure out if there's ghodium hydride, ghodium acid, or catalyzed ghodium acid laying around.
        // or just go straight for the good stuff. RESOURCE_CATALYZED_GHODIUM_ACID

        if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
            }
        } else {

// need a util method to go get energy prioritizing the storage. STEAL from builder!

            // find nearest source (with energy)
            // use findPath to sort

            // this shit needs to be a module or something.
            let sources = _.flatten([
                creep.room.find(FIND_SOURCES_ACTIVE),
                creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] > 0;
                    }
                })
            ]);

            if (sources.length > 0) {
                //console.log(sources);

                // ok, this is not efficient anymore. use the built in method instead
                const closestSource = sources.sort((sourceA, sourceB) => {
                    return creep.room.findPath(creep.pos, sourceA.pos).length - creep.room.findPath(creep.pos, sourceB.pos).length;
                })[0];
                //console.log(closestSource);
                if (closestSource.structureType && closestSource.structureType == STRUCTURE_CONTAINER) {
                    if (creep.withdraw(closestSource, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closestSource, { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                } else {
                    if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
                        //console.log(`role.upgrader: ${creep.name} moving to ${closestSource}.`)
                        creep.moveTo(closestSource, { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }
            } else {
                // waste
                //console.log('role.upgrader: No sources available.');
            }
        }
    }
};

module.exports = roleUpgrader;