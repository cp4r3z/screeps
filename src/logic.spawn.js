module.exports = (spawnName) => {

    // all these need to get pushed into a config file. UGLY
    const SPAWN_PROPS = {
            harvesters: {
                min: 3
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
            // These are RATIOS
            parts: {
                worker: { m: 2, w: 1, c: 1 },
                killer: { m: 2, t: 1, a: 1 }
            }

        };

    const spawnEnergy = Game.spawns[spawnName].energy,
        extensions = Game.spawns[spawnName].room.find(FIND_MY_STRUCTURES, {
            filter: (extension) => {
                return extension.structureType == STRUCTURE_EXTENSION;
            }
        }),
        totalEnergy = spawnEnergy + extensions.reduce((total, extension) => total + extension.energy, 0),
        spawnCapacity = Game.spawns[spawnName].energyCapacity;
    let totalCapacity = spawnCapacity + extensions.reduce((total, extension) => total + extension.energyCapacity, 0);


    // Uncomment this to see the total energy available for spawning. I need a debug module.
    //console.log(`Spawn: ${spawnName}, Total Energy: ${totalEnergy}/${totalCapacity}`);

    // TOWER LOGIC

    const hostiles = Game.spawns[spawnName].room.find(FIND_HOSTILE_CREEPS);

    const towers = Game.spawns[spawnName].room.find(
        FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
    towers.forEach(tower => {

        if (hostiles.length > 0) {
            const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            tower.attack(closestHostile);
        } else {
            const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if (closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }
        }
    });

    if (Game.spawns[spawnName].spawning) {
        const spawningCreep = Game.creeps[Game.spawns[spawnName].spawning.name];
        Game.spawns[spawnName].room.visual.text(
            'Spawning a new ' + spawningCreep.memory.role,
            Game.spawns[spawnName].pos.x + 1,
            Game.spawns[spawnName].pos.y, { align: 'left', opacity: 0.8 });
    } else {
        // I feel like there's a way to use lodash to create a sorted "creeps" object
        const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.room == Game.spawns[spawnName].room),
            upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.room == Game.spawns[spawnName].room),
            builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.room == Game.spawns[spawnName].room),
            killers = _.filter(Game.creeps, (creep) => creep.memory.role == 'killer' && creep.room == Game.spawns[spawnName].room);

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
                const username = hostiles[0].owner.username;
                Game.notify(`UNDER ATTACK`);
                if (killers.length < SPAWN_PROPS.hunters.min) {
                    newName = 'Killer' + Game.time;
                    Game.spawns[spawnName].spawnCreep(utils.creep.parts.getCreepDesc(totalEnergy, CREEP_PROPS.parts.killer).list, newName, { memory: { role: 'killer' } });
                }

            } else if (harvesters.length < SPAWN_PROPS.harvesters.min) {
                newName = 'Harvester' + Game.time;
                console.log('Attempting to spawn new harvester: ' + newName);
                Game.spawns[spawnName].spawnCreep(utils.creep.parts.getCreepDesc(totalEnergy, CREEP_PROPS.parts.worker).list, newName, { memory: { role: 'harvester' } });

            } else if (upgraders.length < SPAWN_PROPS.upgraders.min) {
                newName = 'Upgrader' + Game.time;
                console.log('Attempting to spawn new upgrader: ' + newName);
                Game.spawns[spawnName].spawnCreep(utils.creep.parts.getCreepDesc(totalEnergy, CREEP_PROPS.parts.worker).list, newName, { memory: { role: 'upgrader' } });

            } else if (builders.length < SPAWN_PROPS.builders.min) {
                newName = 'Builder' + Game.time;
                console.log('Attempting to spawn new builder: ' + newName);
                Game.spawns[spawnName].spawnCreep(utils.creep.parts.getCreepDesc(totalEnergy, CREEP_PROPS.parts.worker).list, newName, { memory: { role: 'builder' } });
            } else {
                //console.log('What a waste.');
                //Some idea... maybe if this happens, we let harvesters withdraw from the nearest extension?
            }
        }
    }
};