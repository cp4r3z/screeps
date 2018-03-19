module.exports = {
    planner(roomHash) {
        /**
         * Overview:
         * 
         * Given a room, plan the room and store the plan in memory.
         * Maybe export a list of props?
         * 
         * Ideas:
         * 
         * Plan the number and type of screeps.
         * Plan the roads.
         * Plan the routes of screeps.
         */

        // is Under Attack?

        // Are there construction sites?
    },
    status(roomHash) {

        let status = {
            constructionSites: Game.rooms[roomHash].find(FIND_MY_CONSTRUCTION_SITES),
            storageOnly: Game.rooms[roomHash].find(FIND_MY_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_STORAGE }), // what about containers?
            storageWithCapacity: Game.rooms[roomHash].find(FIND_MY_STRUCTURES, { filter: structure => (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && _.sum(structure.store) < structure.storeCapacity }),
            storageWithEnergy: Game.rooms[roomHash].find(FIND_MY_STRUCTURES, {
                filter: (structure) =>
                    (
                        (structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0) ||
                        (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0)
                    )
            }),
            extensions: {
                all: Game.rooms[roomHash].find(FIND_MY_STRUCTURES, {
                    filter: structure => structure.structureType == STRUCTURE_EXTENSION
                }),
                needingEnergy: Game.rooms[roomHash].find(FIND_MY_STRUCTURES, {
                    filter: structure => structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity
                })
            },
            hostiles: Game.rooms[roomHash].find(FIND_HOSTILE_CREEPS),
            minerals: Game.rooms[roomHash].find(FIND_MINERALS),
            sources: {
                all: Game.rooms[roomHash].find(FIND_SOURCES),
                active: Game.rooms[roomHash].find(FIND_SOURCES_ACTIVE)
            },
            // For some reason, saving a spawn in memory causes circular logic.
            spawns: {
                // all: Game.rooms[roomHash].find(FIND_MY_STRUCTURES, {
                //     filter: structure => structure.structureType == STRUCTURE_SPAWN
                // }),
                // needingEnergy: Game.rooms[roomHash].find(FIND_MY_STRUCTURES, {
                //     filter: structure => structure.structureType == STRUCTURE_SPAWN && structure.energy < structure.energyCapacity
                // })
            },
            // WALLS aren't part of MY_STRUCTURES
            structuresNeedingRepair: Game.rooms[roomHash].find(FIND_STRUCTURES, {
                filter: object => object.hits < object.hitsMax && object.hits < 1e6 // arbitrary "max"
            }).sort((a, b) => a.hits - b.hits),
            terminals: {
                all: Game.rooms[roomHash].find(FIND_MY_STRUCTURES, {
                    filter: structure => structure.structureType == STRUCTURE_TERMINAL
                }),
                needingEnergy: Game.rooms[roomHash].find(FIND_MY_STRUCTURES, {
                    filter: structure => structure.structureType == STRUCTURE_TERMINAL && structure.store[RESOURCE_ENERGY] < 3000
                }),
                withCapacity: Game.rooms[roomHash].find(FIND_MY_STRUCTURES, {
                    filter: structure => structure.structureType == STRUCTURE_TERMINAL && _.sum(structure.store) < structure.storeCapacity // I have no idea what this needs
                }),
            },
            towers: {
                all: Game.rooms[roomHash].find(FIND_MY_STRUCTURES, {
                    filter: structure => structure.structureType == STRUCTURE_TOWER
                }),
                needingEnergy: Game.rooms[roomHash].find(FIND_MY_STRUCTURES, {
                    filter: structure => structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity
                })
            }
        };

        // status.extensions.needingEnergy = _.filter(status.extensions.all, structure => structure.energy < structure.energyCapacity);
        // status.spawns.needingEnergy = _.filter(status.spawns.all, structure => structure.energy < structure.energyCapacity);
        // status.towers.needingEnergy = _.filter(status.towers.all, structure => structure.energy < structure.energyCapacity);
        // status.terminals.needingEnergy = _.filter(status.terminals.all, structure => structure.store[RESOURCE_ENERGY] < 3000); // I have no idea what this needs.                            
        // status.terminals.withCapacity = _.filter(status.terminals.all, structure => _.sum(structure.store) < structure.storeCapacity);

        status.repairTotal = _.reduce(status.structuresNeedingRepair, (result, structure) => { return 1e6 - structure.hits }, 0);

        status.isUnderAttack = status.hostiles.length > 0;
        status.areActiveSources = status.sourcesActive.length > 0;
        status.areConstructionSites = status.constructionSites.length > 0;
        status.repairNeeded = status.structuresNeedingRepair.length > 0 && status.repairTotal > (20 * 1500); // Avg repair/tick * life of creep ?
        status.areTerminalsNotAtCapacity = status.terminals.withCapacity.length > 0;

        _.each(status.minerals, mineral => status.hasMineral = status.hasMineral || mineral.mineralAmount > 0);

        Memory.rooms[roomHash] = status;

        //console.log(`Room: ${roomHash} Controller: ${Game.rooms[roomHash].controller.progress}/${Game.rooms[roomHash].controller.progressTotal} | ${Game.rooms[roomHash].controller.progress/Game.rooms[roomHash].controller.progressTotal} `);        
    }
};