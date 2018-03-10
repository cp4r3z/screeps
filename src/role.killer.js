var roleKiller = {

    /** @param {Creep} creep **/
    run(creep) {
        let target;
        target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target) {
            let hasRangedAttack = false;
            _.each(creep.body, part => {
                if (_.includes(part, RANGED_ATTACK)) { hasRangedAttack = true; }
            })
            if (hasRangedAttack) {
                if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } else{
                if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } 
        } else {
            target = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
            if (target.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }
};

module.exports = roleKiller;