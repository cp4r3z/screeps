module.exports = {
    creep: {
        parts: {
            list(description) {
                // accepts a description object. Something like:
                /*
                {
                    m: 3,
                    w: 1,
                    c: 2
                }
                */
                // returns an array of CONSTANTS
                // Reference : http://docs.screeps.com/api/#Creep
                /*
                MOVE
                WORK
                CARRY
                ATTACK
                RANGED_ATTACK
                HEAL
                CLAIM
                TOUGH
                */
                const PARTS = {
                    m: MOVE,
                    w: WORK,
                    c: CARRY,
                    a: ATTACK,
                    r: RANGED_ATTACK,
                    h: HEAL,
                    cl: CLAIM,
                    t: TOUGH
                };
                let list = [];
                let cost = 0;
                for (const part in description) {
                    list = list.concat(Array(description[part]).fill(PARTS[part]));
                    cost += BODYPART_COST[PARTS[part]] * description[part];
                }
                console.log(`Creep Cost: ${cost}`);
                return list;
            }
        }
    }
};