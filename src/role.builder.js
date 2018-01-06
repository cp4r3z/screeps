var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if (creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('harvesting');
        }
        if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('building');
        }

        if (creep.memory.building) {
            // Generate Roads from all structures
            // Energy Sources
            // Spawn
            // Controller
            // Containers
            // 
            //const roadNodes = [].concat(Game.spawns['Spawn1'].room.find(FIND_MY_SPAWNS),);
            const sources = Game.spawns['Spawn1'].room.find(FIND_SOURCES_ACTIVE); //let's just start here.


            let path = Game.spawns['Spawn1'].room.findPath(Game.spawns['Spawn1'].pos, sources[0].pos, {
                ignoreCreeps: true
            });
            
            for (let pathPos of path) {
                //create construction site (road)
                const sites = Game.spawns['Spawn1'].room.getPositionAt(pathPos.x, pathPos.y).lookFor(LOOK_CONSTRUCTION_SITES);
                console.log(sites);
                //if (Game.spawns['Spawn1'].room.getPositionAt(pathPos.x, pathPos.y).lookFor(LOOK_CONSTRUCTION_SITES)[0]){}
                Game.spawns['Spawn1'].room.getPositionAt(pathPos.x, pathPos.y).createConstructionSite(STRUCTURE_ROAD);
            }

            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length) {
                if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        }
        else {
            // find nearest source (with energy)
            // use findPath to sort
            // !!! There's a native method for this.
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
