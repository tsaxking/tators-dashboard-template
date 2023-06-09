FIRSTYear[2023] = class {
    static calculateMatchScoutingAccuracy (event) {
        const { matches } = event;
        
        if (!matches.length) return [];
        const accuracies = matches.map(match => {
            // Returns an array that will deleted by a flatten
            if (!match) return [];

            if (match.compLevel != "qm") return [];

            const { projectedScoreBreakdown, scoreBreakdown } = match;

            if (!scoreBreakdown) return [];

            const { red, blue } = scoreBreakdown;

            if (!red || !blue) return [];

            const calculateAccuracy = (tba, alliance) => {
                const { totalPoints, foulPoints, linkPoints } = tba;
                const totalMatchScouting = match.totalMatchScoutingScore(alliance);


                // Calculating the margin of error
                return Math.abs((totalPoints - foulPoints) - totalMatchScouting);
            }

            return [
                calculateAccuracy(red, "red"),
                calculateAccuracy(blue, "blue"),
            ];
        }).flat(Infinity); // This flatten will remove empty arrays but not integers
        // This is just a way to have maps be able to remove element form an array
        // The flatten also lets us return array of the accuracy for each alliance.

        if (!accuracies.length) return 0;

        return accuracies.filter(a => typeof a == "number").reduce((a, b) => a + b)/accuracies.length;
    }

    /**
     * Compares out projected data to the tba data for an entire event
     * Returns how many points off the projection algorithm is on average.
     * @param {FIRSTEvent} event The event to calculate with
     */
    static calculateAverageProjectionAccuracy (event) {
        const { matches } = event;
        
        if (!matches.length) return [];
        const accuracies = matches.map(match => {
            // Returns an array that will deleted by a flatten
            if (!match) return [];

            const { projectedScoreBreakdown, scoreBreakdown } = match;

            if (!scoreBreakdown) return [];

            const { red, blue } = scoreBreakdown;
            red.balance = match.getBalanceAmount({ alliance: "red" }, "endgame");
            blue.balance = match.getBalanceAmount({ alliance: "blue" }, "endgame");
            red.parked = match.getParkedAmount("red");
            blue.parked = match.getParkedAmount("blue");


            if (!red || !blue) return [];

            const { red: projectedRed, blue: projectedBlue } = projectedScoreBreakdown;

            const calculateAccuracy = (tba, projected) => {
                const { totalPoints, foulPoints, autoBridgeState, autoDocked, teleopCommunity, balance, parked, endgameBridgeState } = tba;
                const { totalScore, autoBalance, grid, endgameBalance } = projected;

                // const tbaScore = balance * (endgameBridgeState == "Level" ? 10 : 6) + parked * 2;

                // return Math.abs(endgameBalance - tbaScore);

                // const tbaNodes = Object.values(teleopCommunity).flat(Infinity);
                // const projectedNodes = grid.flat(Infinity);

                // const placed = tbaNodes.filter(n => n != "None").length;
                // const projectedPlaced = projectedNodes.filter(n => n).length;
                // // console.log(placed, projectedPlaced);
                // return Math.abs(placed - projectedPlaced);

                // if (!autoDocked && !autoBalance) return 1;
                // if (autoBridgeState == "NotLevel" && autoBalance == 8) return 1;
                // if (autoBridgeState == "Level" && autoBalance == 12) return 1;

                // const accuracies = tbaNodes.map((node, i) => {
                //     const projectedNode = projectedNodes[i];
                //     if (node == "None" && !projectedNode) return [];
                //     else if (node != "None" && projectedNode) return 1;
                //     else return 0;
                // });

                // return accuracies;

                // Calculating the margin of error
                return Math.abs((totalPoints - foulPoints) - totalScore);// (totalPoints - foulPoints) - totalScore;
                // return (totalPoints - foulPoints) - totalScore;
            }

            // return Math.abs((red.totalPoints - blue.totalPoints) - (projectedRed.totalScore - projectedBlue.totalScore));
            return [
                calculateAccuracy(red, projectedRed),
                calculateAccuracy(blue, projectedBlue),
            ];
        }).flat(Infinity); // This flatten will remove empty arrays but not integers
        // This is just a way to have maps be able to remove element form an array
        // The flatten also lets us return array of the accuracy for each alliance.

        if (!accuracies.length) return 0;

        return accuracies.reduce((a, b) => a + b)/accuracies.length;
    }

    static tuneProjector (event) {
        const matchClass = FIRSTMatch[2023];
        const arr = _ => Array.from({ length: 3 }).fill();
        
        const thresholdAccuracies = arr().map((_, i) => {
            matchClass.projectedAutoBalanceThreshold = i/12;

            return arr().map((_, j) => {
                console.log({ i, j})

                matchClass.projectedParkThreshold = j/12;
                return arr().map((_, k) => {
                    matchClass.projectedMobilityThreshold = k/12;
                    return arr().map((_, l) => {
                        matchClass.projectedPieceRoundingThreshold = l/12;
                        return arr().map((_, m) => {
                            matchClass.projectedEndgameBalanceThreshold = m/12;
                            return {
                                accuracy: this.calculateAverageProjectionAccuracy(currentEvent),
                                i, j, k, l, m
                            }
                        });
                    });
                });
            });
        }).flat(Infinity);

        return thresholdAccuracies.sort((a, b) => {
            return a.accuracy - b.accuracy;
        });
    }

    //    █   █ █▄ █ █▄▀ ▄▀▀ 
    //    █▄▄ █ █ ▀█ █ █ ▄█▀ 

    /**
     * Calculates how many links there are based off of a match's grid
     * @param {boolean} calculateScore Whether this show calculate the amount of links or score gained from links
     * @return {(match: { overall: { grid: string }}) => number}
     */
    static calculateLinks = calculateScore => match => {
        // Getting the grid from the match
        const { overall: { grid } } = match;

        if (!grid) return 0;

        // Getting the three rows from the grid
        const [high, middle, low] = grid.split('-');

        // console.log(high, middle, low);

        // Getting the amount of links in each row
        const allLinks = [high, middle, low].map(this.rowLinks);

        // Adding up the links between the three rows
        const sum = allLinks.reduce((a, b) => a + b);

        // 5 points per link if it should calculate score otherwise it is just the sum
        return calculateScore ? sum * 5 : sum;
    }

    /**
     * Returns the amount of links in 1 row
     * @param {string} row the row as a string of nine 0s or 1s
     * @returns {number}
     */
    static rowLinks = row => {
        let i = 0; // third location

        // possible strings str == '111' '110' '101' '100' '011' '010' '001' '000'
        /**
         * Returns last index of 0, If the last index is -1 that means there was a link
         * @param {String} str 
         * @returns {Number} 
         */
        const testStr = (str) => str.lastIndexOf('0');

        let links = 0;
        while (i < row.length) {
            // Takes a portion of the row
            const str = row.slice(i, i + 3);

            // stops if it exceeds the row length
            if (str.length !== 3) break;

            // Tests whether the chunk of 3 has 3 things in it
            const index = testStr(str);

            // Changes i in order to double counting
            if (index === -1) {
                links++;
                i += 3;
            } else {
                i += index + 1;
            }
        }

        return links;
    }

    static getRow = timeSegment => row => match => {
        const grid = match[timeSegment].grid;

        if (!grid) return;

        // Finding the row within the grid for that time segment and turning it into an array
        try {
            const gridRow = grid.split("-")[row].split("");
            return gridRow;
        } catch (e) {
            console.error(e);
        }
    }

    // ▄▀  █▀▄ █ █▀▄    ▄▀▀ ▄▀▀ ▄▀▄ █▀▄ ██▀ 
    // ▀▄█ █▀▄ █ █▄▀    ▄█▀ ▀▄▄ ▀▄▀ █▀▄ █▄▄ 

    /**
     * Gets the score or placing amount from a row of a grid during a certain time 
     * @param {string} timeSegment Either auto, teleop, or endgame
     * @returns {(height: string) => (calculateScore: boolean) => (match: {}) => number }
     */
    static getGridScore = timeSegment => {
        // Gets the score bonus from placing during auto
        const timeScore = timeSegment.toLowerCase() == "auto" ? 1 : 0;

        // Height is either "high", "middle", or "low"
        return height => {
            let row;
            let score = +timeScore;

            // Calculates the row and score that correspond to that height
            switch (height.toLowerCase()) {
                case "high":
                    row = 2;
                    score += 5
                    break;
                case "middle":
                    row = 1;
                    score += 3;
                    break;
                case "low":
                    row = 0;
                    score += 2;
                    break;
                default:
                    row = height.toLowerCase();
                    break;
            }

            /**
             * Returns an array of 9 0s or 1s corresponding to the 9 nodes on the row and time defined above during the match passed in.
             * @param {Object} match A match containing auto, teleop, and endgame info
             * @returns {Array[number]}
             */
            const getRow = this.getRow(timeSegment.toLowerCase())(row);

            return calculateScore => match => {
                const row = getRow(match);

                if (!row) return 0;

                // Adding up the array of ones and zeroes in order to get how many nodes were placed on
                const amount = row.reduce((acc, curr) => { return acc + (+curr) }, 0);

                // Returning either the score gained from placing or the amount of placing performed
                return calculateScore ? amount * score : amount;
            }
        }
    }

    /**
     * Combines the grid scores for several heights
     * @param {string} timeSegment The time segment that you want to collect grid data within
     * @returns {(heights: string[] => calculateScore: boolean => match: {} => number)}
     */
    static getGridScoreHeights = timeSegment => {
        // Creates a partial function that already has the timeSegment inputted
        const timeSpecificGetGridScore = this.getGridScore(timeSegment);
        return heights => calculateScore => match => {
            // Creates a reduce function that will sum up all the scores from each of the heights
            const combineHeights = sumFunction(height => timeSpecificGetGridScore(height)(calculateScore)(match));
            return combineHeights(heights);
        }
    }

    /**
     * @description Gets all of the placements inside several timeSegments
     * @param {stringArray} timeSegments The time segments you want to get placements from
     * @returns {(calculateScore: boolean) => (match: {}): number}
     */
    static getGridScoreTimeSegments = timeSegments => {
        return calculateScore => match => {
            // Creates a reduce function that will cycle through each time segment and get it's score/place amount and then sum the scores
            const combineTimeSegments = sumFunction(timeSegment => this.getGridScoreHeights(timeSegment)(["high", "middle", "low"])(calculateScore)(match));
            return combineTimeSegments(timeSegments);
        }
    }

    /**
     * @description gets the total amount of times placed or total score from placing in a match.
     * @param {boolean} calculateScore whether you want to calculate the score or amount placed
     * @return {(match: {} => number)}
     */
    static getGridScoreOverall = this.getGridScoreTimeSegments(["auto", "teleop", "endgame"]);

    static getSegment (time) {
        // if (time < 0) return "end";
        if (time < 15) return 'auto';
        if (time < 120) return `teleop`;
        if (time < 150) return 'endgame';
        else return "end";
    }

    /**
     * Returns how many times in a match during a specific time segment a bot did a specific action
     * @param {string} [time] What time segment you want to filter by if this is blank it will check the entire match
     * @returns { (action: string) => (match: { trace: [{ action: string }] }) => number }
     */
    static traceAmount = time => action => match => match.trace.filter(traceAction => {
        // returns if the t is a path rather than an action
        if (!traceAction.action) return;

        const [ x, y, t ] = traceAction.p; 
        const lenientActions = [
            "level",
            "notLevel",
            "tipped",
            "notTipped",
        ];

        // If someone hits the balance or docked button 30 or less seconds late this will still count it 
        // just so that if someone is off by a bit it won't mess up the data
        const segment = this.getSegment(lenientActions.includes(action) ? t - 30 : t);

        // Returns true if the action is the same type of action and in the same time segment
        return (traceAction.action == action) && (!time || (time.toLowerCase() == segment));

        // Since this has now filtered out all the matches that you aren't looking for you can take the length to get how many match your query
    }).length;

    /**
     * Returns either the balance score from a time segment or just whether they balanced
     * @param {string} time either auto, teleop or endgame 
     * @returns { (type: string) => (calculateScore: boolean) => (match: { trace: Array }) => number }
     */
    static getBalanceScore(time) {
        // Getting the extra score you gain from balancing during auto
        const scoreTimeBoost = time.toLowerCase() == "auto" ? 2 : 0;

        // Gets a partial of the trace amount function so that you don't have to input the time parameter twice
        const traceAmountForTime = FIRSTYear[2023].traceAmount(time);

        // This is defined before being returned because it is somewhat recursive (its only 1 deep)
        const getScoreForTime = type => {
            // Calculation for the score you get from the two type of balancing 
            let score;
            switch (type) {
                case "level":
                    score = 10 + scoreTimeBoost;
                    break;
                case "tipped":
                    score = 6 + scoreTimeBoost;
                    break;
                default:
                    score = 0;
                    break;
            }

            // Getting a partial for how many times the robot balanced inside a match
            const isType = traceAmountForTime(type);
            // Getting a partial for how many times it stopped balancing
            const notType = traceAmountForTime("not" + upperCaseFirstLetter(type));

            // Calculating whether the robot was level since you don't get points for docking if it was level
            let isOtherType = () => false;
            if (type == "tipped") {
                isOtherType = getScoreForTime("level")(false);
            }

            return calculateScore => match => {
                // Calculating if the robot balanced more times then it stopped balancing (basically whenever it stops balancing it cancels out 1 time it was balancing)
                const didThing = (isType(match) - notType(match)) > 0;
                const didOtherThing = isOtherType(match);
                // Overriding the previous variable if it was level and tipped so that it is just level
                const didThingOverridden = +(didThing && !didOtherThing);

                // Multiplying by the score if you need to otherwise just giving a 0 or 1
                return calculateScore ? score * didThingOverridden : didThingOverridden;
            }
        }
        return getScoreForTime;
    }

    /** 
     * @description Gets the balance score for multiple timeSegments or type of balancing and adds them together
     * @param {string[]} times An array of all the different times you want to collect
     * @return {(type: string[]) => (calculateScore: boolean) => (match: {}) => number}
     */
    static getBalanceScoreMultiple = times => types => calculateScore => match => {
        if (calculateScore && match.match) {
            const total = times.reduce((acc, time) => {
                return acc + match.tbaBalanceScore(time);
            }, 0);

            return total;
        }

        return times.reduce((acc, time) => {
            return acc + types.reduce((acc2, type) => {
                return acc2 + this.getBalanceScore(time)(type)(calculateScore)(match);
            }, 0)
        }, 0);
        // Creates a function that will sum together all of the score gained from the given types in a time segment
        // const sumTypesForTime = time => sumFunction(type => this.getBalanceScore(time)(type)(calculateScore)(match));
        // Creates a function that will sum together all the time segments and types
        // const combineTimes = sumFunction(time => sumTypesForTime(time)(types));
        // return combineTimes(times);
    }

    /**
     * @description gets the total amount of times balanced or total score from balancing in a match.
     * @param {boolean} calculateScore whether you want to calculate the score or amount balanced
     * @return {(match: {} => number)}
     */
    static getBalanceScoreOverall = this.getBalanceScoreMultiple(["auto", "teleop", "endgame"])(["level", "tipped"]);

    // TODO: This could all be 1 function?
    /**
     * Gets whether a robot got points for auto mobility
     * @param {boolean} calculateScore whether it should return the score from auto mobility (3) or just 1
     * @returns { (match: { auto: { autoMobility: boolean } }) => number }
     */
    static getAutoMobility = calculateScore => match => {
            // Deconstructing autoMobility from match
            const { auto: { autoMobility } } = match;
            const mobilityScore = 3;

            // Returning the value (+!! is so that it is coerced into a number if it is undefined)
            return calculateScore ? +!!autoMobility * mobilityScore : +!!autoMobility;
        }
        /**
         * Gets whether a robot got points for parking during endgame
         * @param {boolean} calculateScore whether it should return the score from parking (2) or just 1
         * @returns { (match: { endgame: { parked: boolean } }) => number }
         */
    static getParked = calculateScore => match => {
        // Deconstructing parked from match
        const { endgame: { parked } } = match;
        const parkingScore = 2;

        // Returning the value (+!! is so that it is coerced into a number if it is undefined)
        return calculateScore ? +!!parked * parkingScore : +!!parked;
    }

    /**
     * @description A list of the different sources that can contribute to a team's score
     * @type {string[]}
     */
    static noLinkScoreContributions = [
        'getGridScoreOverall',
        'getBalanceScoreOverall',
        'getAutoMobility',
        'getParked'
    ];

    /**
     * @description A list of the different sources that can contribute to a team's score
     * @type {string[]}
     */
    static scoreContributions = [
        'calculateLinks',
        ...this.noLinkScoreContributions,
    ];

    /**
     * @description A function that takes in different score categories and a match then returns the combination of the different categories
     * @param {boolean} calculateScore Whether to calculate score or total actions performed
     * @returns {(match: {}) => (arr: string[]) => number}
     */
    static sumCategories = calculateScore => match => sumFunction(category => this[category](calculateScore)(match));

    static timeSegmentScore = time => match => {
        let score = 0;
        if (time == "auto") score += this.getAutoMobility(true)(match) + this.getBalanceScoreMultiple(["auto"])(["level", "tipped"])(true)(match);
        if (time == "teleop") score += this.calculateLinks(true)(match);
        if (time == "endgame") score += this.getParked(true)(match) + this.getBalanceScoreMultiple(["teleop", "endgame"])(["level", "tipped"])(true)(match);

        return score + this.getGridScoreTimeSegments([time])(true)(match);
    }

    /**
     * Gets the total score a robot contributed to a match
     * @param {object} match A match to get the score from 
     * @returns {number}
     */
    static totalScore = match => {
        return this.sumCategories(true)(match)(this.scoreContributions);
    }

    static totalScoreWithoutLinks = match => {
        return this.sumCategories(true)(match)(this.noLinkScoreContributions);
    }

    // This is initialized in global.js after map is initialized because you can't run functions that don't exist yet
    /**
     * @description Returns an array of the total scores a robot contributed to each of it's matches
     * @param {object[]} arr An array of all the robot's matches
     * @returns {number[]}
     */
    static totalTeamScores; // equal to map(FIRSTYear[2023].totalScore);



    static combineGridRow(...rows) {
        const num = rows.map(toDec).reduce((a, c) => {
            a = a | c;
            return a;
        }, 0);
        const bin = toBin(num);
        return new Array(9 - bin.length).fill('0').join('') + bin;
    }

    static combineGrids(...grids) {
        return new Array(3).fill('000000000').map((r, i) => {
            return grids.reduce((a,c) => {
                return this.combineGridRow(c.split('-')[i], a);
            }, r)
        }).join('-');
    }

    /**
     * Takes in a doubled array of truthy or falsey values and returns the grid in string format ("0000-0000-000...")
     * @param {any[][]} grid An array of values where truthy ones are where they placed
     */
    static convertDoubledGridArrayToString (grid) {
        const stringGrid = grid.reduce((acc, row, i) => {
            // Adds a dash if i isn't 0 and nothing if i is 0
            const dash = i ? "-" : "";
            return acc + dash + row.reduce((acc, col) => {
                // Converts col to a bool by using !!
                // Converts col to a number using + (it will be either 0 or 1 because it was just a bool)
                // Converts col to a string using + [] (it will be either "0", or "1" because it was just 0 or 1)
                return acc + +!!col + [];
            }, "")
        }, "");

        return stringGrid;
    }
}