/**
 * This space intentionally left blank.
 */

const CONFIG = require('./config'),
    utils = require('./utils'),
    logicCreep = require('./logic.creep'),
    logicRoom = require('./logic.room'),
    logicSpawn = require('./logic.spawn');

module.exports.loop = function() {

    // MEMORY

    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    // ROOMS

    for (const room in Game.rooms) {
        logicRoom.planner(room);
        logicRoom.status(room);
    }

    // SPAWNS

    for (const spawn in Game.spawns) {
        logicSpawn(spawn);
    }

    // CREEPS

    logicCreep();
}
