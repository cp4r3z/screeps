module.export = {
    move(creep, dest) {
        const pathFlags = {
            //ignoreCreeps: true
        };

        const path = creep.room.findPath(creep.pos, dest.pos, pathFlags);
        if (path.length > 0) {
            if (creep.move(path[0].direction) == OK) {
                // Code?
            }
            else {
                creep.say('No voy')
            }
        }
        else {
            creep.say('Perdido');
        }
    }
};
