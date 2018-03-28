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
                    return 0;
                }
            } else {
                //transfer
                const lab = _.filter(roomMemory.labs.all, lab => {
                    return (lab.mineralType == mineralNeeded || lab.mineralType === undefined) && lab.mineralAmount <= lab.mineralCapacity;
                })[0];
                if (!lab) return 1;
                if (creep.transfer(lab, mineralNeeded) == ERR_NOT_IN_RANGE) {
                    base.utils.movement.toDest(creep, lab, 20);
                    //exit the each?
                    return 0;
                }
            }
        };

        const upgrade = function() {
            let retVal = creep.upgradeController(creep.room.controller);
            if (retVal == ERR_NOT_IN_RANGE) {
                retVal = base.utils.movement.toDest(creep, creep.room.controller, 20);
                return retVal;
            } else {
                return retVal;
            }
        };

        // Returns 0 if it was boosted. Returns something else if not.
        const boost = function() {
            let canBoost = false,
                lab,
                isFullyBoosted = true;

            _.forEach(creep.body, part => { if (!part.boost) isFullyBoosted = false; });

            if (isFullyBoosted) { return 1; } else {
                lab = _.filter(roomMemory.labs.all, lab => {
                    return lab.mineralType == mineralNeeded &&
                        lab.mineralAmount > 20 && lab.energy > 20;
                });
                canBoost = lab.length > 0;
                lab = lab[0];
            }

            if (!canBoost) { return 1; } else {
                if (Memory.DEBUG) console.log(`${creep.name} can be boosted with ${mineralNeeded}!`);
                const retVal = lab.boostCreep(creep);
                if (retVal == ERR_NOT_IN_RANGE) {
                    base.utils.movement.toDest(creep, lab, 20);
                } else if (retVal !== OK) {
                    return retVal;
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
            upgrade();
        } else {
            let retVal;
            retVal = moveMinerals(mineralNeeded);
            // There's probably some shortcut for this pattern
            if (retVal !== 0) retVal = boost();
            if (retVal !== 0) retVal = base.getEnergy();
        }
    }
};

module.exports = roleUpgrader;