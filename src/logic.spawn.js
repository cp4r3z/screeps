const utils = require('./utils'),
    logicTower = require('./logic.tower');

module.exports = (spawnName) => {

    const spawn = Game.spawns[spawnName];    

    // Get the room status from memory
    const roomMemory = Memory.rooms[spawn.room.name];

    // all these need to get pushed into a config file. UGLY
    const SPAWN_PROPS = {
            harvesters: {
                min: roomMemory.sources.length
            },
            upgraders: {
                min: roomMemory.sources.length
            },
            harvestersMineral: {
                min: 1
            },
            builders: {
                min: 2
            },
            hunters: {
                min: 2
            }
        },
        CREEP_PROPS = {
            // These are RATIOS
            parts: {
                worker: { m: 2, w: 1, c: 1 },
                slow_worker: { m: 1, w: 1, c: 1 },
                killer: { m: 2, t: 1, a: 1 }
            }

        };

    const spawnEnergy = spawn.energy,
        extensions = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: (extension) => {
                return extension.structureType == STRUCTURE_EXTENSION;
            }
        }),
        totalEnergy = spawnEnergy + extensions.reduce((total, extension) => total + extension.energy, 0),
        spawnCapacity = spawn.energyCapacity;
    let totalCapacity = spawnCapacity + extensions.reduce((total, extension) => total + extension.energyCapacity, 0);


    // Uncomment this to see the total energy available for spawning. I need a debug module.
    //console.log(`Spawn: ${spawnName}, Total Energy: ${totalEnergy}/${totalCapacity}`);

    // TOWER LOGIC -- this can be its own thing

    const hostiles = spawn.room.find(FIND_HOSTILE_CREEPS);

    spawn.room
        .find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } })
        .map(logicTower);

    if (spawn.spawning) {
        const spawningCreep = Game.creeps[spawn.spawning.name];
        spawn.room.visual.text(
            'Spawning a new ' + spawningCreep.memory.role,
            spawn.pos.x + 1,
            spawn.pos.y, { align: 'left', opacity: 0.8 });
    } else {
        // I feel like there's a way to use lodash to create a sorted "creeps" object

        //TODO: Isn't this a room status thing?

        const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.room == spawn.room),
            harvestersMineral = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvesterMineral' && creep.room == spawn.room),
            upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.room == spawn.room),
            builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.room == spawn.room),
            killers = _.filter(Game.creeps, (creep) => creep.memory.role == 'killer' && creep.room == spawn.room);

        // Find the scout reserver, regardless of room.
        const scoutReservers = _.filter(Game.creeps, (creep) => creep.memory.role == 'scoutReserver');

        const extractors = spawn.room.find(FIND_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_EXTRACTOR });
        const minBuilder = (roomMemory.constructionSites.length > 1) ? SPAWN_PROPS.builders.min : 1;
        const isWipedOut = harvesters.length === 0 || upgraders.length === 0;
        if (isWipedOut) {
            // Do not consider the extensions, as they probably won't be filled.
            if (!totalEnergy > spawnCapacity) {
                totalCapacity = spawnCapacity;
            }
        }
        const minHarvestersMineral = (extractors.length > 0) ? SPAWN_PROPS.harvestersMineral.min : 0;        

        const isAtCapacity = totalEnergy >= totalCapacity * .5, // Yeah, this needs some help. This allows for a lesser creep to be built during hard times.
            isSpawning = spawn.spawning,
            shouldSpawn = !isSpawning && (isWipedOut || roomMemory.isUnderAttack || isAtCapacity);

        if (shouldSpawn) {
            let newName;
            // This Under Attack logic could produce non-ideal attackers.
            if (roomMemory.isUnderAttack) {
                // Hey we're under attack. Yay.

                Game.notify(`UNDER ATTACK`);
                if (killers.length < SPAWN_PROPS.hunters.min) {
                    newName = 'Killer' + Game.time;
                    spawn.spawnCreep(utils.creep.parts.getCreepDesc(totalEnergy, CREEP_PROPS.parts.killer).list, newName, { memory: { role: 'killer' } });
                }

            } else if (harvesters.length < SPAWN_PROPS.harvesters.min) {
                newName = 'Harvester' + Game.time;
                spawn.spawnCreep(utils.creep.parts.getCreepDesc(totalEnergy, CREEP_PROPS.parts.worker).list, newName, { memory: { role: 'harvester' } });
            } else if (harvestersMineral.length < minHarvestersMineral && roomMemory.hasMineral) {
                newName = 'HarvesterMineral' + Game.time;
                spawn.spawnCreep(utils.creep.parts.getCreepDesc(totalEnergy, CREEP_PROPS.parts.slow_worker).list, newName, { memory: { role: 'harvesterMineral' } });
            } else if (upgraders.length < SPAWN_PROPS.upgraders.min) {
                newName = 'Upgrader' + Game.time;
                spawn.spawnCreep(utils.creep.parts.getCreepDesc(totalEnergy, CREEP_PROPS.parts.slow_worker).list, newName, { memory: { role: 'upgrader' } });

            } else if (builders.length < minBuilder) {
                newName = 'Builder' + Game.time;
                spawn.spawnCreep(utils.creep.parts.getCreepDesc(totalEnergy, CREEP_PROPS.parts.worker).list, newName, { memory: { role: 'builder' } });
            } else if (scoutReservers.length < 1 && spawn.room.name == 'E12N47') {
                newName = 'ScoutReserver' + Game.time;
                spawn.spawnCreep([CLAIM, MOVE, CLAIM, MOVE], newName, { memory: { role: 'scoutReserver', dest: 'E12N46' } });
            } else {
                //console.log('What a waste.');
                //Some idea... maybe if this happens, we let harvesters withdraw from the nearest extension?
            }
        }
    }
};