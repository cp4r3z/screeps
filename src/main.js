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
                min: 1
            },
            upgraders: {
                min: 2
            },
            builders: {
                min: 1
            },
        },
        CREEP_PROPS = {
            parts: {
                carry_fast: [WORK, CARRY, MOVE, MOVE],
                carry_big: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
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
    } else {
        // I feel like there's a way to use lodash to create a sorted "creeps" object
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        var newName;

        if (harvesters.length < SPAWN_PROPS.harvesters.min) {
            newName = 'Harvester' + Game.time;
            console.log('Attempting to spawn new harvester: ' + newName);
            Game.spawns[spawnName].spawnCreep(CREEP_PROPS.parts.carry_fast, newName, { memory: { role: 'harvester' } });
        } else if (upgraders.length < SPAWN_PROPS.upgraders.min) {
            newName = 'Upgrader' + Game.time;
            console.log('Attempting to spawn new upgrader: ' + newName);
            Game.spawns[spawnName].spawnCreep(CREEP_PROPS.parts.carry_fast, newName, { memory: { role: 'upgrader' } });
        } else if (builders.length < SPAWN_PROPS.builders.min) {
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
    }
}