const role = {
    harvester: require('./role.harvester'),
    harvesterMineral: require('./role.harvester.mineral'),
    upgrader: require('./role.upgrader'),
    builder: require('./role.builder'),
    builderSpawn: require('./role.builder.spawn'),
    scout: require('./role.scout'),
    killer: require('./role.killer')
}

module.exports = () => {
    const rolesByRank = [
        'killer',
        'harvesterMineral',
        'upgrader',
        'builder',
        'builderspawn',
        'scout'
    ];

    const creepsRanked = _.sortBy(Game.creeps, [(creep) => rolesByRank.indexOf(Game.creeps[creep].memory.role)]);

    _.forEach(creepsRanked, (creep) => role[creep.memory.role].run(creep));
};