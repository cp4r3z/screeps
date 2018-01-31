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
        // is Under Attack?
        const hostiles = Game.rooms[roomHash].find(FIND_HOSTILE_CREEPS);
        const isUnderAttack = hostiles.length > 0;
        const minerals = Game.rooms[roomHash].find(FIND_MINERALS);

        let roomStatus = {
            [roomHash]: {
                status: {
                    isUnderAttack: isUnderAttack
                },
                minerals: minerals
            }
        };
        _.assign(Memory.rooms, roomStatus);
        
        // Are there construction sites?
    }
};