/**
 * This space intentionally left blank.
 */

const CONFIG = require('./config'),
    utils = require('./utils'),
    logicCreep = require('./logic.creep'),
    logicRoom = require('./logic.room'),
    logicMarket = require('./logic.market'),
    logicSpawn = require('./logic.spawn');

module.exports.loop = function() {

    // ROOMS

    for (const room in Game.rooms) {
        logicRoom.planner(room);
        logicRoom.status(room);
    }

    for (const room in Memory.rooms) {
        if (!Game.rooms[room]) {
            delete Memory.rooms[room];
        }
    }

    // SPAWNS

    for (const spawn in Game.spawns) {
        logicSpawn(spawn);
    }

    // CREEPS

    logicCreep();

    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            const adjective = _.sample(['Brave', 'Wise', 'Pure', 'Not Quite So Brave']);
            console.log(`
                In Memoriam: ${name}
                ${adjective} ${Memory.creeps[name].role}.
                Thank you for your service.
                `);
            delete Memory.creeps[name];
        }
    }

    // MARKET

    logicMarket();
}