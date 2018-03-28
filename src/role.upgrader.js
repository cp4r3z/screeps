var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.role !== 'upgrader' || creep.memory.role == 'harvester') return;

        // Get the room status from memory
        const roomMemory = Memory.rooms[creep.room.name];

        // Load the base creep module
        const base = require('./role.base')(creep, roomMemory);

        const mineralNeeded = RESOURCE_GHODIUM_HYDRIDE;

        const moveMinerals = function(mineralNeeded) {
            //withdraw from terminal and deposit into lab
            //if there's some in the terminal or storage and you're not full, withdraw

            const target = _.filter(roomMemory.terminals.all, terminal => terminal.store[mineralNeeded] > 0)[0];

            const total = _.sum(creep.carry);
            if (target && total < creep.carryCapacity) {
                //withdraw

                if (creep.withdraw(target, mineralNeeded) == ERR_NOT_IN_RANGE) {
                    base.utils.movement.toDest(creep, target);
                }
            } else {
                //transfer
                const lab = _.filter(roomMemory.labs.all, lab => {
                    return (lab.mineralType == mineralNeeded || lab.mineralType === undefined) && lab.mineralAmount <= lab.mineralCapacity;
                })[0];
                if (!lab) return 1;
                if (creep.transfer(target, mineralNeeded) == ERR_NOT_IN_RANGE) {
                    base.utils.movement.toDest(creep, target, 20);
                    //exit the each?
                    return 0;
                }
            }
        };

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

            let canBoost = false,
                lab,
                isFullyBoosted = true;

            _.forEach(creep.body, part => { if (!part.boost) isFullyBoosted = false; });

            if (!isFullyBoosted) {
                lab = _.filter(roomMemory.labs.all, lab => { 
                    return lab.mineralType == mineralNeeded && lab.mineralAmount > 0 && lab.energy > 0; 
                });
                canBoost = lab.length > 0;
                lab = lab[0];
            }

            if (canBoost) {
                if (Memory.DEBUG) console.log(`${creep.name} can be boosted with ${mineralNeeded}!`);
                if (lab.boostCreep(creep) == ERR_NOT_IN_RANGE) {
                    base.utils.movement.toDest(creep, lab, 20);
                }
            } else {
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    base.utils.movement.toDest(creep, creep.room.controller, 20);
                }
            }

        } else {
            //ew
            if (moveMinerals(mineralNeeded) !== 0) {
                base.getEnergy();
            }
        }
    }
};

module.exports = roleUpgrader;