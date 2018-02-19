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
            constructionSites: spawn.room.find(FIND_MY_CONSTRUCTION_SITES),
            extensions: Game.rooms[roomHash].find(FIND_MY_STRUCTURES, {
                filter: (extension) => {
                    return extension.structureType == STRUCTURE_EXTENSION;
                }
            }),
            hostiles: Game.rooms[roomHash].find(FIND_HOSTILE_CREEPS),
            minerals: Game.rooms[roomHash].find(FIND_MINERALS),
            sources: Game.rooms[roomHash].find(FIND_SOURCES)
        };

        status.isUnderAttack = status.hostiles.length > 0;
        
        _.each(status.minerals, mineral => status.hasMineral = status.hasMineral || mineral.mineralAmount > 0);

        _.assign(Memory.rooms, {
            [roomHash]: status
        });

        //console.log(`Room: ${roomHash} Controller: ${Game.rooms[roomHash].controller.progress}/${Game.rooms[roomHash].controller.progressTotal} | ${Game.rooms[roomHash].controller.progress/Game.rooms[roomHash].controller.progressTotal} `);        
    }
};