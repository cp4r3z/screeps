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
            storageWithEnergy: Game.rooms[roomHash].find(FIND_MY_STRUCTURES, {
                filter: (structure) =>
                    (
                        (structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0) ||
                        (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0)
                    )
            }),
            extensions: Game.rooms[roomHash].find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_EXTENSION;
                }
            }),
            hostiles: Game.rooms[roomHash].find(FIND_HOSTILE_CREEPS),
            minerals: Game.rooms[roomHash].find(FIND_MINERALS),
            sources: Game.rooms[roomHash].find(FIND_SOURCES),
            sourcesActive: Game.rooms[roomHash].find(FIND_SOURCES_ACTIVE),
            structuresNeedingRepair: Game.rooms[roomHash].find(FIND_MY_STRUCTURES, {
                filter: object => object.hits < object.hitsMax && object.hits < 1e5 // arbitrary "max"
            }).sort((a, b) => a.hits - b.hits),
            terminalsWithCapacity: Game.rooms[roomHash].find(FIND_MY_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_TERMINAL && _.sum(structure.store) < structure.storeCapacity })
        };

        status.isUnderAttack = status.hostiles.length > 0;
        status.areActiveSources = status.sourcesActive.length > 0;
        status.areConstructionSites = status.constructionSites.length > 0;
        status.repairNeeded = status.structuresNeedingRepair.length > 0;
        status.areTerminalsNotAtCapacity = status.terminalsWithCapacity.length > 0;

        _.each(status.minerals, mineral => status.hasMineral = status.hasMineral || mineral.mineralAmount > 0);

        _.assign(Memory.rooms, {
            [roomHash]: status
        });

        //console.log(`Room: ${roomHash} Controller: ${Game.rooms[roomHash].controller.progress}/${Game.rooms[roomHash].controller.progressTotal} | ${Game.rooms[roomHash].controller.progress/Game.rooms[roomHash].controller.progressTotal} `);        
    }
};