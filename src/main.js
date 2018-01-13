/**
 * This space intentionally left blank.
 */

const CONFIG = require('./config'),
    utils = require('./utils'),
    roleHarvester = require('./role.harvester'),
    roleUpgrader = require('./role.upgrader'),
    roleBuilder = require('./role.builder'),
    roleScout = require('./role.scout');

//UTILS.creep.parts.getHeavy(1099);

module.exports.loop = function() {

    const spawnName = 'Spawn1', // eventually this will have to be independent...

        spawnEnergy = Game.spawns[spawnName].energy,
        extensions = Game.spawns[spawnName].room.find(FIND_MY_STRUCTURES, {
            filter: (extension) => {
                return extension.structureType == STRUCTURE_EXTENSION;
            }
        }),
        totalEnergy = spawnEnergy + extensions.reduce((total, extension) => total + extension.energy, 0),
        spawnCapacity = Game.spawns[spawnName].energyCapacity;
    let totalCapacity = spawnCapacity + extensions.reduce((total, extension) => total + extension.energyCapacity, 0);
    // all these need to get pushed into a config file. UGLY
    const SPAWN_PROPS = {
            harvesters: {
                min: 4
            },
            upgraders: {
                min: 3
            },
            builders: {
                min: 3
            },
            hunters: {
                min: 2
            }
        },
        CREEP_PROPS = {
            // odd that these things aren't arrays of strings... shrug
            parts: {
                carry_fast: { m: 2, w: 1, c: 1 }, // = 100 + 50*3 = 250
                carry_big: { m: 4, w: 2, c: 6 }, // = 100*2 + 50*8 = 600
                upgrade_big: { m: 7, w: 1, c: 7 }, // = 100*1 + 50*14 = 800
                // hey you know what? Maybe the upgraders don't need WORK. OH YES THEY DO!
                kill: { m: 2, t: 1, a: 1 }
            }

        };

    // Uncomment this to see the total energy available for spawning. I need a debug module.
    //console.log(`Total Energy: ${totalEnergy}/${totalCapacity}`);
    var tower = Game.getObjectById('5a51aac196005e55af510071');
    if (tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if (closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            tower.attack(closestHostile);
        }
    }

    for (const name in Memory.creeps) {
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
        const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester'),
            upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader'),
            builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder'),
            hunters = _.filter(Game.creeps, (creep) => creep.memory.role == 'hunter');

        var hostiles = Game.spawns[spawnName].room.find(FIND_HOSTILE_CREEPS);

        const isWipedOut = harvesters.length === 0 || upgraders.length === 0;
        if (isWipedOut) {
            // Do not consider the extensions, as they probably won't be filled.
            if (!totalEnergy > spawnCapacity) {
                totalCapacity = spawnCapacity;
            }
        }
        const isUnderAttack = hostiles.length > 0;

        const isAtCapacity = totalEnergy >= totalCapacity,
            isSpawning = Game.spawns[spawnName].spawning,
            shouldSpawn = isWipedOut || isUnderAttack || (!isSpawning && isAtCapacity);

        if (shouldSpawn) {
            let newName;
            // This Under Attack logic could produce non-ideal attackers.
            if (isUnderAttack) {
                // Hey we're under attack. Yay.
                var username = hostiles[0].owner.username;
                const killDesc = { a: 1, t: 1 };
                Game.notify(`UNDER ATTACK`);
                if (hunters.length < SPAWN_PROPS.hunters.min) {
                    newName = 'Killer' + Game.time;
                    Game.spawns[spawnName].spawnCreep(utils.creep.parts.getWorker(totalEnergy, killDesc).list, newName, { memory: { role: 'hunter' } });
                }
                // hardcoded name = BAD
                var towers = Game.rooms['E13N46'].find(
                    FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
                towers.forEach(tower => tower.attack(hostiles[0]));
            } else if (harvesters.length < SPAWN_PROPS.harvesters.min) {
                newName = 'Harvester' + Game.time;
                console.log('Attempting to spawn new harvester: ' + newName);
                Game.spawns[spawnName].spawnCreep(utils.creep.parts.getWorker(totalEnergy).list, newName, { memory: { role: 'harvester' } });

            } else if (upgraders.length < SPAWN_PROPS.upgraders.min) {
                newName = 'Upgrader' + Game.time;
                console.log('Attempting to spawn new upgrader: ' + newName);
                Game.spawns[spawnName].spawnCreep(utils.creep.parts.getWorker(totalEnergy).list, newName, { memory: { role: 'upgrader' } });

            } else if (builders.length < SPAWN_PROPS.builders.min) {
                newName = 'Builder' + Game.time;
                console.log('Attempting to spawn new builder: ' + newName);
                Game.spawns[spawnName].spawnCreep(utils.creep.parts.getWorker(totalEnergy).list, newName, { memory: { role: 'builder' } });
            } else {
                //console.log('What a waste.');
                //Some idea... maybe if this happens, we let harvesters withdraw from the nearest extension?
            }
        }
    }

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
        if (creep.memory.role == 'killer') {
            roleKiller.run(creep);
        }
        if (creep.memory.role == 'scout') {
            roleScout.run(creep);
        }
    }
}