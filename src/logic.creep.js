module.exports = () => {
    const rolesByRank = [{
            role: 'killer',
            path: './role.killer'
        },
        {
            role: 'harvester',
            path: './role.harvester'
        },
        {
            role: 'upgrader',
            path: './role.upgrader'
        },
        {
            role: 'builder',
            path: './role.builder'
        },
        {
            role: 'builderSpawn',
            path: './role.builder.spawn'
        },
        {
            role: 'harvesterMineral',
            path: './role.harvester.mineral'
        },
        {
            role: 'harvesterRemote',
            path: './role.harvester.remote'
        },
        {
            role: 'scout',
            path: './role.scout'
        },
        {
            role: 'scoutReserver',
            path: './role.scout.reserver'
        }
    ];

    const creepsRanked = _.sortBy(Game.creeps, [creep => _.findIndex(rolesByRank, 'role', Game.creeps[creep].memory.role)]);

    _.forEach(creepsRanked, (creep) => {
        if (Game.cpu.getUsed() < 10) { //Use Game.cpu.limit instead of 10 if you ever pay.
            const path = _.result(_.find(rolesByRank, 'role', creep.memory.role), 'path');
            const role = require(path);
            role.run(creep);
        }
    });
};