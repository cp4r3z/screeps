const utils = require('./utils');

module.exports = (spawnName) => {

    const spawn = Game.spawns[spawnName];

    // Get the room status from memory
    const roomMemory = Memory.rooms[spawn.room.name];

    // all these need to get pushed into a config file. UGLY
    const SPAWN_PROPS = {
            harvesters: {
                min: roomMemory.sources.active.length
            },
            upgraders: {
                min: roomMemory.sources.active.length
            },
            harvestersMineral: {
                min: 1
            },
            builders: {
                min: (roomMemory.constructionSites.are || roomMemory.repairNeeded) ? 1 : 0
            },
            hunters: {
                min: roomMemory.hostiles.length
            }
        },
        CREEP_PROPS = {
            // These are RATIOS
            parts: {
                worker: { m: 2, w: 1, c: 1 },
                slow_worker: { m: 1, w: 1, c: 1 },
                killer: { m: 2, t: 1, a: 1 },
                killer2: { m: 2, t: 1, r: 1 },
                scout: { c, m }
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

    if (Memory.DEBUG) console.log(`Spawn: ${spawnName}, Total Energy: ${totalEnergy}/${totalCapacity}`);

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

        // Find remote harvesters, regardless of room.
        const remoteHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvesterRemote');

        const extractors = spawn.room.find(FIND_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_EXTRACTOR });
        //const minBuilder = (roomMemory.constructionSites.length > 1 || roomMemory.repairNeeded) ? 1 : 0;
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
            shouldSpawn = !isSpawning && (isWipedOut || roomMemory.hostiles.are || isAtCapacity);

        const spawnCreep = function(options) {

            // Default values
            const partsIdeal = options.partsIdeal || CREEP_PROPS.parts.slow_worker,
                partsBackup = options.partsBackup || CREEP_PROPS.parts.worker,
                energy = options.energy || totalEnergy,
                name = `${options.namePrefix}_${spawn.room.name}_${Game.time.toString().slice(-4)}`;

            if (spawn.spawnCreep(utils.creep.parts.getCreepDesc(energy, partsIdeal).list, name, { memory: { role: options.role, dest: options.dest, home: options.home } }) !== OK) {
                let retVal;
                retVal = spawn.spawnCreep(utils.creep.parts.getCreepDesc(totalEnergy, partsBackup).list, name, { memory: { role: options.role, dest: options.dest, home: options.home } });
                if (retVal != OK) {
                    console.log(`spawn ${spawn.name} | Return Value: ${retVal}`);
                }
            }
        };

        if (shouldSpawn) {
            let options;
            if (roomMemory.hostiles.are && killers.length < SPAWN_PROPS.hunters.min) {
                // Hey we're under attack. Yay.
                options = {
                    namePrefix: 'K',
                    role: 'killer',
                    partsIdeal: CREEP_PROPS.parts.killer2,
                    partsBackup: CREEP_PROPS.parts.killer
                };
            } else if (harvesters.length < SPAWN_PROPS.harvesters.min) {
                options = {
                    namePrefix: 'H',
                    role: 'harvester'
                };
            } else if (upgraders.length < SPAWN_PROPS.upgraders.min) {
                options = {
                    namePrefix: 'U',
                    role: 'upgrader'
                };
            } else if (builders.length < SPAWN_PROPS.builders.min && roomMemory.constructionSites.length > 0) {
                options = {
                    namePrefix: 'B',
                    role: 'builder',
                    energy: totalEnergy / 2
                };
            } else if (harvestersMineral.length < minHarvestersMineral && roomMemory.hasMineral && Game.cpu.bucket > 5000) {
                options = {
                    namePrefix: 'HM',
                    role: 'harvesterMineral',
                    energy: totalEnergy / 2
                };
            } else if (scoutReservers.length < 1 && spawn.room.name == 'E12N47' && Game.cpu.bucket > 5000) {
                options = {
                    namePrefix: 'SR',
                    role: 'scoutReserver',
                    dest: 'E12N46',
                    partsIdeal: CREEP_PROPS.parts.scout,
                    partsBackup: CREEP_PROPS.parts.scout,
                    energy: 1300
                };
                //would be nice to reserve other rooms too.
            } else if (remoteHarvesters.length <= 3 && isAtCapacity && Game.cpu.bucket > 5000) {
                //Oh, this is a mess. We need a more "global" plan.
                options = {
                    namePrefix: 'HR',
                    role: 'harvesterRemote',
                    dest: 'E12N46',
                    home: spawn.room.name,
                    energy: totalEnergy / 2
                };
                if (spawn.room.name == 'E12N47') options.dest = 'E12N48';
            } else {
                //console.log('What a waste.');
                //Some idea... maybe if this happens, we let harvesters withdraw from the nearest extension?
            }
            if (options) spawnCreep(options);
        }
    }
};