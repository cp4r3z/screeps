var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('harvesting');
        }
        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('building');
        }

        if(creep.memory.building) {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
        else {
            // find nearest source (with energy)
            // use findPath to sort
            var sources = creep.room.find(FIND_SOURCES, {
                filter: (source) => {
                    return source.energy > 0;
                }
            });            
            var closestSource = sources.sort((sourceA, sourceB) => creep.room.findPath(creep.pos, sourceA.pos) - creep.room.findPath(creep.pos, sourceB.pos))[0];

            if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
                //console.log(`role.upgrader: ${creep.name} moving to ${closestSource}.`)
                creep.moveTo(closestSource, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
    }
};

module.exports = roleBuilder;