const role = {
    harvester: require('./role.harvester'),
    harvesterMineral: require('./role.harvester.mineral'),
    harvesterRemote: require('./role.harvester.remote'),
    upgrader: require('./role.upgrader'),
    builder: require('./role.builder'),
    builderSpawn: require('./role.builder.spawn'),
    scout: require('./role.scout'),
    scoutReserver: require('./role.scout.reserver'),
    killer: require('./role.killer')
};

module.exports = () => {
    const rolesByRank = [
        'killer',
        'harvester',
        'upgrader',
        'builder',
        'builderSpawn',
        'harvesterMineral',
        'harvesterRemote',
        'scout',
        'scoutReserver'
    ];

    const creepsRanked = _.sortBy(Game.creeps, [(creep) => rolesByRank.indexOf(Game.creeps[creep].memory.role)]);

    _.forEach(creepsRanked, (creep) => { if (Game.cpu.getUsed() < Game.cpu.tickLimit) role[creep.memory.role].run(creep); });
};