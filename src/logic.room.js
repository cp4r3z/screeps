module.exports = {
    planner(roomHash){
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
    status(roomHash){
         // is Under Attack?
         const hostiles = Game.rooms[roomHash].find(FIND_HOSTILE_CREEPS);
         const isUnderAttack = hostiles.length > 0;
         Memory.rooms[roomHash].status.isUnderAttack = isUnderAttack;
         // Are there construction sites?
    }
};