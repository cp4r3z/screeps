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

// const BODYPART_COST = {
//     "move": 50,
//     "work": 100,
//     "attack": 80,
//     "carry": 50,
//     "heal": 250,
//     "ranged_attack": 150,
//     "tough": 10,
//     "claim": 600
// };

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
                // returns an array of CONSTANTS and a cost
                // Reference : http://docs.screeps.com/api/#Creep
                let list = [];
                let cost = 0;
                for (const part in description) {
                    list = list.concat(Array(description[part]).fill(PARTS[part]));
                    cost += BODYPART_COST[PARTS[part]] * description[part];
                }
                console.log(`Creep Cost: ${cost}`);
                return {
                    list,
                    cost
                };
            },
            list2(description) {
                const BODYPART_COST = {
                    "move": 50,
                    "work": 100,
                    "attack": 80,
                    "carry": 50,
                    "heal": 250,
                    "ranged_attack": 150,
                    "tough": 10,
                    "claim": 600
                };
                const PARTS = {
                    m: 'move',
                    w: 'work',
                    c: 'carry',
                    a: 'attack',
                    r: 'ranged_attack',
                    h: 'heal',
                    cl: 'claim',
                    t: 'tough'
                };

                let list = [];
                let cost = 0;
                for (const part in description) {
                    list = list.concat(Array(description[part]).fill(PARTS[part]));
                    cost += BODYPART_COST[PARTS[part]] * description[part];
                }
                console.log(`Creep Cost: ${cost}`);
                return {
                    list,
                    cost
                };
            },
            getWorker(energyCapacity) {
                const baseDesc = {
                    m: 2,
                    w: 1,
                    c: 1
                };
                let energyUsed = 200, // EW
                    // Start with a minimum creep    
                    description = {
                        m: 2,
                        w: 1,
                        c: 1,
                        a: 0,
                        r: 0,
                        h: 0,
                        cl: 0,
                        t: 0
                    },
                    adding = true;
                // Ok, there has to be a better way to do this.
                    while (adding) {
                    let added = false;
                    for (const part in baseDesc) {
                        for (let i = 0; i < baseDesc[part]; i++) {
                            energyUsed += BODYPART_COST[PARTS[part]];
                            if (energyUsed <= energyCapacity) {
                                description[part]++;
                                added = true;
                            } else {
                                energyUsed -= BODYPART_COST[PARTS[part]];
                            }
                        }
                    }
                    if (!added) adding = false;
                }
                return this.list(description);
            }
        }
    }
};