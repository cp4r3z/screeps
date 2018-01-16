const role = {
    harvester: require('./role.harvester'),
    upgrader: require('./role.upgrader'),
    builder: require('./role.builder'),
    builderSpawn: require('./role.builder.spawn'),
    scout: require('./role.scout'),
    killer: require('./role.killer')
}

/*
const roleHarvester = require('./role.harvester'),
    roleUpgrader = require('./role.upgrader'),
    roleBuilder = require('./role.builder'),
    roleBuilderSpawn = require('./role.builder.spawn'),
    roleScout = require('./role.scout'),
    roleKiller = require('./role.killer');
*/

module.exports = () => {
    const rolesByRank = [
        'killer',
        'harvester',
        'upgrader',
        'builder',
        'builderspawn',
        'scout'
    ];

    function sortByRank(a, b) {
        const creepRoleA = Game.creeps[a].memory.role,
            creepRoleB = Game.creeps[b].memory.role,
            roleRankA = rolesByRank.indexOf(creepRoleA),
            roleRankB = rolesByRank.indexOf(creepRoleB);
        if (roleRankA > 0 || roleRankB > 0) {
            return roleRankA - roleRankB;
        } else {
            console.log('creep logic: bad sort');
            return 1;
        }
    }

    const creepsRanked = Game.creeps.sort(sortByRank);

    _foreach(creepsRanked, (creep) => role[creep.memory.role].run(creep));

    /*
    for (const name in creepsRanked) {
        const creep = Game.creeps[name];
        if (creep.memory.role == 'killer') {
            roleKiller.run(creep);
        } else if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        } else if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        } else if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        } else if (creep.memory.role == 'builderspawn') {
            roleBuilderSpawn.run(creep);
        } else if (creep.memory.role == 'scout') {
            roleScout.run(creep);
        }
    }
    */
};