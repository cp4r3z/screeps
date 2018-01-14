/**
 * This space intentionally left blank.
 */

const CONFIG = require('./config'),
    utils = require('./utils'),
    logicRoom = require('./logic/logic.room.js'),
    logicSpawn = require('./logic/logic.spawn.js'),
    roleHarvester = require('./role.harvester'),
    roleUpgrader = require('./role.upgrader'),
    roleBuilder = require('./role.builder'),
    roleBuilderSpawn = require('./role.builder.spawn'),
    roleScout = require('./role.scout'),
    roleKiller = require('./role.killer');

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
        logicRoom(room);
    }

    // SPAWNS

    for (const spawn in Game.spawns) {
        logicSpawn(spawn);
    }

    // CREEPS

    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if (creep.memory.role == 'builderspawn') {
            roleBuilderSpawn.run(creep);
        }
        if (creep.memory.role == 'killer') {
            roleKiller.run(creep);
        }
        if (creep.memory.role == 'scout') {
            roleScout.run(creep);
        }
    }
}