module.exports = {
    toDest(creep, dest, reusePath) {
        // const pathFlags = {
        //     ignoreCreeps: true
        // };

        /*
        const path = creep.room.findPath(creep.pos, dest.pos, pathFlags);
        if (path.length > 0) {
            if (creep.move(path[0].direction) == OK) {
                // Code?
                // store location in memory or global
            }
            else {
                creep.say('No voy')
            }
        }
        else {
            creep.say('Perdido');
        }
        */

        //http://docs.screeps.com/api/#Creep.moveTo
        const opts = {
            reusePath: reusePath || 5 // Game default is 5
        };

        const retVal = creep.moveTo(dest);
        if (retVal != OK) {
            console.log(`creep ${creep.name} | moveTo err: ${retVal}`);
        }

    }
};