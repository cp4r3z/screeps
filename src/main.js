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

    // DEBUG

    Memory.DEBUG = false;

    if (Memory.DEBUG) console.log(`CPU Bucket: ${Game.cpu.bucket}`);

    if (Game.cpu.bucket < 20) return;

    let cpuUsage = [{ step: '0', cpu: 0 }];

    // ROOMS

    if (Memory.DEBUG) cpuUsage.push({ step: 'Loop Start', cpu: Game.cpu.getUsed() });

    for (const room in Game.rooms) {
        logicRoom.planner(room);
        logicRoom.status(room);
    }

    for (const room in Memory.rooms) {
        if (!Game.rooms[room]) {
            delete Memory.rooms[room];
        }
    }

    if (Memory.DEBUG) cpuUsage.push({ step: 'Room Logic', cpu: Game.cpu.getUsed() });

    // SPAWNS

    for (const spawn in Game.spawns) {
        logicSpawn(spawn);
    }

    if (Memory.DEBUG) cpuUsage.push({ step: 'Spawn Logic', cpu: Game.cpu.getUsed() });;

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

    if (Memory.DEBUG) cpuUsage.push({ step: 'Creep Logic', cpu: Game.cpu.getUsed() });
    
    // MARKET

    logicMarket();

    if (Memory.DEBUG) cpuUsage.push({ step: 'Market Logic', cpu: Game.cpu.getUsed() });
    
    if (Memory.DEBUG) {
        _.each(cpuUsage, (usage, i, col) => {
            if (i > 0) console.log(`CPU Used: ${(usage.cpu - col[i-1].cpu).toFixed(2)} for ${usage.step}`)
        });
    }
}
