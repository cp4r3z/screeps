/**
 * This space intentionally left blank.
 */

const CONFIG = require('config');
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

module.exports.loop = function() {

    const spawnName = 'Spawn1', // eventually this will have to be independent...
        // all these need to get pushed into a config file. UGLY
        SPAWN_PROPS = {
            harvesters: {
                min: 2
            },
            upgraders: {
                min: 2
            },
            builders: {
                min: 1
            },
            hunters: {
                min: 2
            }
        },
        CREEP_PROPS = {
            // odd that these things aren't arrays of strings... shrug
            parts: {
                carry_fast: [WORK, CARRY, MOVE, MOVE], // = 100 + 50*3 = 250
                carry_big: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // = 100*4 + 50*9 = 850
                kill: [TOUGH, ATTACK, MOVE, MOVE]
            }

        };
    // var tower = Game.getObjectById('TOWER_ID');
    // if(tower) {
    //     var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
    //         filter: (structure) => structure.hits < structure.hitsMax
    //     });
    //     if(closestDamagedStructure) {
    //         tower.repair(closestDamagedStructure);
    //     }

    //     var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    //     if(closestHostile) {
    //         tower.attack(closestHostile);
    //     }
    // }

    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    if (Game.spawns[spawnName].spawning) {
        var spawningCreep = Game.creeps[Game.spawns[spawnName].spawning.name];
        Game.spawns[spawnName].room.visual.text(
            'Spawning a new ' + spawningCreep.memory.role,
            Game.spawns[spawnName].pos.x + 1,
            Game.spawns[spawnName].pos.y, { align: 'left', opacity: 0.8 });
    }
    else {
        // I feel like there's a way to use lodash to create a sorted "creeps" object
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        var hunters = _.filter(Game.creeps, (creep) => creep.memory.role == 'hunter');
        var newName;

        var hostiles = Game.spawns[spawnName].room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            // Hey we're under attack. Yay.
            var username = hostiles[0].owner.username;
            Game.notify(`User ${username} spotted in room ${roomName}`);
            if (hunters.length < SPAWN_PROPS.hunters.min) {
                newName = 'Killer' + Game.time;
                Game.spawns[spawnName].spawnCreep(CREEP_PROPS.parts.kill, newName, { memory: { role: 'hunter' } });
            }
            // var towers = Game.rooms[roomName].find(
            //     FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
            // towers.forEach(tower => tower.attack(hostiles[0]));
        }
        else if (harvesters.length < SPAWN_PROPS.harvesters.min) {

            if (Game.spawns[spawnName].energy >= 850) {
                newName = 'HarvesterHeavy' + Game.time;
                console.log('Attempting to spawn new big harvester: ' + newName);
                Game.spawns[spawnName].spawnCreep(CREEP_PROPS.parts.carry_big, newName, { memory: { role: 'harvester' } });
            }
            else {
                newName = 'Harvester' + Game.time;
                console.log('Attempting to spawn new harvester: ' + newName);
                Game.spawns[spawnName].spawnCreep(CREEP_PROPS.parts.carry_fast, newName, { memory: { role: 'harvester' } });
            }

        }
        else if (upgraders.length < SPAWN_PROPS.upgraders.min) {
            newName = 'Upgrader' + Game.time;
            console.log('Attempting to spawn new upgrader: ' + newName);
            Game.spawns[spawnName].spawnCreep(CREEP_PROPS.parts.carry_fast, newName, { memory: { role: 'upgrader' } });
        }
        else if (builders.length < SPAWN_PROPS.builders.min) {
            newName = 'Builder' + Game.time;
            console.log('Attempting to spawn new builder: ' + newName);
            Game.spawns[spawnName].spawnCreep(CREEP_PROPS.parts.carry_fast, newName, { memory: { role: 'builder' } });
        }
    }

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if (creep.memory.role == 'killer') {
            roleKiller.run(creep);
        }
    }
}
