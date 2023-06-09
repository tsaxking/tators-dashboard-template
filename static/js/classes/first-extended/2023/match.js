FIRSTMatch[2023] = class extends FIRSTMatch {
    static TeamProjection = class {
        /**
         * A grid of where a team places on average
         * @param {number[][]} averagedGrid A doubled number array
         */
        constructor (averagedGrid, number) {
            this.averageGrid = averagedGrid;
            this.nodePickList = this.buildNodePickList();
            this.number = number;

            // How many nodes this 
            const integerPieces = Math.floor(this.averagePlaceAmount);
            const remainder = this.averagePlaceAmount % 1;
            this.placeLimit = integerPieces + (remainder >= FIRSTMatch[2023].projectedPieceRoundingThreshold ? 1 : 0);
            this.placed = 0;
        }

        /**
         * @description Gets a ranking of which nodes this team will pick in which order
         * This is based off where they place most on average
         * Returns an array of the position of each node 
         * and the average amount each node is place on
         * @type {{ x: number, y: number, average: number }[]}
         */ 
        buildNodePickList () {
            // Converting the grid of average places to a grid which includes x and y
            // After it is converted when can then flatten it without losing the x and y positions
            const flattenedGrid = this.averageGrid.map((row, x) => {
                return row.map((col, y) => {
                    return {
                        average: col,
                        x,
                        y,
                    } 
                });
            }).flat();

            // Filtering out all of the nodes where this has never placed (0 is falsey)
            const filteredGrid = flattenedGrid.filter(node => node.average);

            // Sorting the grid based on the average placement
            filteredGrid.sort((a, b) => {
                // Prioritizing high placements if it's a tie
                if (a.average == b.average) return b.x - a.x;
                // Sorting by averages otherwise.
                return b.average - a.average;
            });
            
            return filteredGrid;
        }

        /**
         * @description Returns how many nodes this team places on average
         * @type {number}
         */ 
        get averagePlaceAmount () {
            // Flattens grid since you just care about 
            // how much they placed in a match on average and not where
            const flattenedGrid = this.averageGrid.flat();

            // Adding up the amount they place on each node on average
            // This gives you the amount they placed on every node on average
            const totalAveragePlace = flattenedGrid.reduce((a, b) => a + b);
            return totalAveragePlace;
        }

        /**
         * Gets the first node of the team's place list
         * Returns the node if there is one or false if it can no longer place.
         * @type {{ x: number, y: number, average: number }}
         */
        get desiredPlace () {
            // Whether this has placed in all of the the nodes it can place in
            // Nodes are removed from the pick list when any team places on a node
            const morePlacements = this.nodePickList.length;
            // Whether this team has already placed on the amount of nodes it would normally place on
            const placedAll = this.placed >= this.placeLimit;
            
            // If there are no more placements then this will return morePlacements (false)
            // If !placedAll evaluates to false (placeAll evaluates as true) then it will return !placedAll(false)
            // If there are morePlacements and it has not placed all this return the first element of the list
            return morePlacements && !placedAll && this.nodePickList[0];
        }
    }

    static AllianceProjection = class { 
        /**
         * 
         * @param {TeamProjection[]} teams An array of projected team objects
         * @param {boolean[][]} grid An existing grid in case this is projecting teleop and components have already been placed during auto
         */
        constructor (teams, grid) {
            this.teams = teams;
            this.grid = grid;
        }

        /**
         * Simulates a round of each team picking
         * @returns {{ x: number, y: number, average: number, team: TeamProjection }}
        */
        simulatePlaceRound () {
            // An array of where the teams will place nodes
            const placements = [];

            // this is a recursive so that if one team doesn't place due to a different team 
            // placing on the same node it can call the function again in order to 
            // re-simulate that team's placements.
            const recursePlaceAttempts = teams => {
                // An array of all the teams that were unable to place
                // that should try to place again
                const retryTeams = [];
                
                // Getting an array of all the places the teams want to place in
                this.teams.map(team => {
                    // Getting the node the team is most likely to place on based where they have placed on the most
                    const { desiredPlace } = team;

                    // If the team has already place everywhere they can this will stop them from placing;
                    if (!desiredPlace) return;
                    const { x, y } = desiredPlace;
                    
                    // Getting whether this placement has already been done by a team
                    // Who put that node higher on their list
                    const gridPlacement = this.grid[x][y];

                    if (gridPlacement) {
                        // Removes the desired placement from the team's list
                        // Stops the team from picking the same node again
                        team.nodePickList.shift();

                        retryTeams.push(team);
                        return;
                    }

                    // Checking if a different team already wants to place there
                    // Additionally there should always be one other existing placement
                    // because if teams one and two both want to place in a node they will
                    // resolve there conflict so even if the third bot wants to place there it will
                    // only show one of the two previous placements
                    const existingPlacement = placements.find(placement => {
                        return placement.x == x &&
                        placement.y == y;
                    });

                    // If a different team doesn't want to place there it just adds 
                    // the desired placement to the placements array as well as the team
                    // that wants to place there
                    if (!existingPlacement) {
                        placements.push({ ...desiredPlace, team });
                        team.placed ++;
                    } else {
                        // The other team that has tried to also place on the same node
                        const { team: otherTeam } = existingPlacement;

                        // getting how many other places the teams can place in
                        const { nodePickList } = team;
                        const { nodePickList: otherNodePickList } = otherTeam;
                        const { length } = nodePickList;
                        const { length: otherLength } = otherNodePickList;

                        // The team with less options will be prioritized since 
                        // the other team is able to just choose a different node more easily
                        if (length > otherLength) {
                            // Removes the first element of the team's list so that it won't keep retrying the same placement
                            nodePickList.shift();

                            // If the other team has less options this team will just retry
                            retryTeams.push(team);
                        } else {
                            // Removes the first element of the other team's list so that it won't keep retrying the same placement
                            otherNodePickList.shift();

                            // Changing which team placed the node 
                            existingPlacement.team = team;

                            // The recursive function will get this team to place again
                            retryTeams.push(otherTeam);
                        }
                    }
                });

                // Gets the team's to try to place again
                if (retryTeams.length) return recursePlaceAttempts(retryTeams);
                // Doesn't have a return value because this function just edits the placements array.
                else return;
            }

            recursePlaceAttempts(this.teams);

            return placements;
        }

        /**
         * Marks node within this object's grid as placed
         * @param {{ x: number, y: number }} nodes 
         */
        placeNodes(nodes) {
            nodes.forEach(node => {
                // Getting where the node is
                const { x, y } = node;

                // Marking that position as placed
                this.grid[x][y] = node.team;
            });
        }
    }
    /**
     * The percentage of your matches that you need to have balanced in for the projecting to predict you will balance
     * @type {number}
     */
    static projectedAutoBalanceThreshold = 1/12;

    /**
     * How often a bot has to have balanced in order to for it to project that it will balance again
     * @type {number}
     */
    static projectedEndgameBalanceThreshold = 0;//0.1;//.9;

    /**
     * How much % of the time (not including matches where they balance) does the robot park
     * in order for the projection algorithm to predict that it will park
     * @type {number}
     */
    static projectedParkThreshold = 0;//.9;
    /**
     * How much % of the time does the robot do mobility
     * in order for the projection algorithm to predict that it will do mobility 
     * @type {number}
     */
    static projectedMobilityThreshold = 0;

    /**
     * If a team has an average placement amount that has a remainder, this is how high it has to be in order for it to be rounded up
     */
    static projectedPieceRoundingThreshold = 2/12;

    /**
     * Projects how much an alliance will score taking into account things like the top row getting filled up and limited charge stations space
     * @param {FIRSTTeam[]} teams An array of first team objects in the alliance
     * @returns {
     *      autoBalance: number, 
     *      endgameBalance: number, 
     *      grid: TeamProjection[][], 
     *      autoGrid: TeamProjection[][], 
     *      linkScore: number, 
     *      gridPlacementScore: number, 
     *      mobilityPoints: number, 
     *      totalScore: number
     * }
     */
    static getProjectedScore (teams) {
        // Getting all of the individual types of scoring functions
        // These were just divided up for organization purposes
        const { 
            projectedAutoBalance,
            projectedEndgameBalance,
            projectGrid,
            blankGrid,
        } = FIRSTMatch[2023];

        const autoBalance = projectedAutoBalance(teams);
        const endgameBalance = projectedEndgameBalance(teams);
        
        // Projects the grid based off where the teams are most likely to place during auto, teleop and endgame
        const autoGrid = projectGrid(teams, "auto", blankGrid);
        // Copying the auto grid because we want to use it to score auto separately later
        // You have to copy each row because of the ways arrays work with dependencies (Javascript is so cool!)
        const teleopGrid = projectGrid(teams, "teleop", autoGrid.map(row => row.slice()));
        // This is cumulative so endgame grid contains every grid combined
        const endgameGrid = projectGrid(teams, "endgame", teleopGrid);

        const { convertDoubledGridArrayToString, calculateLinks } = FIRSTYear[2023];

        // Converts the grid string into a format that works with the calculate links function
        const gridString = convertDoubledGridArrayToString(endgameGrid);

        // Calculates the links
        const linkScore = calculateLinks(true)({ overall: { grid: gridString } });

        const calculateGridScore = timeScore => (acc, row, i) => {
            // Getting how many points you score from the row
            const rowScore = !i ? 2 : i === 1 ? 3 : 5;

            // Getting how many points you score between auto and the row
            const score = timeScore + rowScore;
            return row.reduce((acc, node) => {
                // Converts node to the numbers 0 or 1 based off it's truthiness
                // multiplies it by the score per node
                return acc + (+!!node * score);
            }, 0);
        }

        // Calculates the score and adds a bonus point to each node placed because of auto.
        const gridPlacementAutoScore = autoGrid.reduce(calculateGridScore(1), 0);

        // Copying the endgame grid because the auto nodes are about to be removed from it
        const overallGrid = endgameGrid.map(row => row.slice());

        autoGrid.forEach((row, i) => {
            row.forEach((node, j) => {
                // You have to do !!node because arrays are true when you !! them but false otherwise
                if (!!node) endgameGrid[i][j] = false;
            });
        });

        // Getting how many points the team has gained from placing (not links)
        const gridPlacementScore = endgameGrid.reduce(calculateGridScore(0)) + gridPlacementAutoScore;
        
        // █▄ ▄█ ▄▀▄ ██▄ █ █   █ ▀█▀ ▀▄▀ 
        // █ ▀ █ ▀▄▀ █▄█ █ █▄▄ █  █   █  
        // If a robot has mobility on average it will get mobility points
        const mobilityPoints = teams.reduce((acc, team) => {
            const { averageMobility } = team.matchScouting;
            const mobilityPoints = 3;
            
            // Return whether it is mobile enough of the time times the amount of points it gets for mobility
            return acc + ((averageMobility >= FIRSTMatch[2023].projectedMobilityThreshold) * mobilityPoints);
        }, 0);
        
        const totalScore = autoBalance 
        + endgameBalance
        + linkScore
        + gridPlacementScore
        + mobilityPoints;
        return { autoBalance, endgameBalance, grid: overallGrid, autoGrid, linkScore, gridPlacementScore, mobilityPoints, totalScore };
    }


    // ██▄ ▄▀▄ █   ▄▀▄ █▄ █ ▄▀▀ ██▀ 
    // █▄█ █▀█ █▄▄ █▀█ █ ▀█ ▀▄▄ █▄▄ 

    /**
     * Projects whether a team will charge, dock, or none in auto and returns the score they will gain
     * @param {FIRSTTeam[]} teams An array of the first teams to get the projection from
     * @returns {number}
     */
    static projectedAutoBalance (teams) {
        // Auto Balance:
        // Getting an array of the autos for each bot
        const balances = teams.map(team => {
            return team.matches.map(match => {
                // Getting how many team's balanced inside auto in this match
                return match.getBalance(team.number, "auto");
            });
        }); 

        // console.log(balances);

        // Get average auto of each robot and see if it is above a certain predefined threshold
        const oftenBalance = balances.map(balances => {
            // Returns an object of whether the robot charges above x% of the time
            // Also returns an object of whether the robot docks or charges x% of the time
            // x is based off of the static property FIRSTMatch[2023].projectedAutoBalanceThreshold

            // Adds up how many times the robot charges
            const totalCharged = balances.reduce((acc, b) => acc + (+(b == "charged")), 0);
            // Adds up how many times the robot docked as well as how many times it charged 
            // since if it charges 25% of the time and docks 50% of the time it should still get credit for docking
            const totalDocked = balances.reduce((acc, b) => acc + (+(b == "docked")), 0) + totalCharged;

            // Averages both quantaties
            const averageCharged = totalCharged/balances.length;
            const averageDocked = totalDocked/balances.length;

            const { projectedAutoBalanceThreshold } = FIRSTMatch[2023];
            // Creates a boolean for whether each average is above (or equal to) a certain predefined threshold or not
            const charged = averageCharged >= projectedAutoBalanceThreshold;
            const docked = averageDocked >= projectedAutoBalanceThreshold;
            return {
                charged,
                docked
            }
        });

        // This just does the commented code but a bit more cleanly
        // charged = robot1.charged || robot2.charged || robot3.charged
        // Docked = robot1.docked || robot2.docked || robot3.docked
        const { charged, docked } = oftenBalance.reduce((acc, team) => {
            return {
                charged: acc.charged || team.charged,
                docked: acc.docked || team.docked,
            }
        }, { charged: false, docked: false });

        // Charging overrides docking
        if (charged) return 12;
        if (docked) return 8;
        return 0;
    }

    /**
     * Projects how many robots will charge in endgame and returns the score they will gain
     * @param {FIRSTTeam[]} teams An array of the first teams to get the projection from
     * @returns {number}
     */
    static projectedEndgameBalance (teams) {
        // getting endgame:
        // Combines docking and charging for now

        // Creates an array for each robot of how many robots they balanced with (0 if they didn't balance).
        const teamsBalances = teams.map(team => {
            return team.matches.map(match => {
                // Getting how many team's balanced inside auto in this match
                return match.getBalanceAmount({ team: team.number }, "endgame");
            });
        }); 

        // console.log(teamsBalances);

        // Takes the max balance that the robot is able to consistently do
        const balancePotential = teamsBalances.map(balances => {
            if (balances.length == 0) return 0;
            // Which amount of balances the bot is consistently able to do
            // Starts with 0 because the bot is probably able to not balance
            const ableBalances = [0];

            // Checking how often a robot does each balance amount
            Array.from({ length: 3 }).forEach((_, i) => {
                // What it is checking for ie. triple balance or double double balance
                const balanceAmount = 3 - i;

                // How many times they have balanced an amount above or equal to the require balanceAmount
                // How often it has done that balancing amount
                const amountBalanced = balances.filter(b => b >= balanceAmount).length;

                // if it is able to balance consistently enough it will add it to the array of consistent balance options
                const { projectedEndgameBalanceThreshold } = FIRSTMatch[2023];
                const averageBalanceAmount = amountBalanced/balances.length;
                const consistentlyBalances = averageBalanceAmount > projectedEndgameBalanceThreshold;
                if (consistentlyBalances) ableBalances.push(balanceAmount);
            });
            return Math.max(...ableBalances);
        });

        // Getting the parking so that the points can be added when calculating balance scores
        // If they balanced instead of parking this will not include it at all in the average
        teams.forEach(team => {
            const { matches } = team;
            let { length } = matches;
            const totalPark = matches.reduce((acc, match) => {
                const balance = match.getBalance(team.number, "endgame");

                // If the robot balanced this will exclude this match by adding 0 to the tutorial
                // and then it decrements the length so that you are punishing the team for balancing
                if (balance == "charged" || balance == "docked") {
                    length --;
                    return acc;
                }
                // Adds 1 if it parks
                if (balance == "Park") return acc + 1; 

                // Adds 0 if it didn't park
                return acc;

            }, 0);

            // Checking if they balanced every single match because then you would be dividing by 0.
            const averagePark = length ? totalPark/length : 0;
            team.canPark = averagePark >= FIRSTMatch[2023].projectedParkThreshold;
        });

        // If all have a max of 3 then three
        // If 2 have a max of 2 then 2
        // If 1 has balanced then 1
        // If 0 have balanced then 0

        // Has a loop that will check if there are >= x teams with a max balance of x
        // x starts at three and goes down to 1
        // This creates an array with 0 for whenever they can't balance and their score if they could 
        const balanceScores = new Array(3).fill().map((_, i) => {
            const x = i + 1; // Adds one to i because it was a 0-based index

            // Checks how many teams are able to balance with x other teams
            // For example, if x is equal to three it will check how many teams are able to triple balance
            const ableToBalance = balancePotential.filter(balance => balance >= x).length;

            let parkingBots = 0;

            // Checks whether there are enough bots that are able to park
            // TODO: This doesn't cover the case where the only bot that can park is the one balancing
            // Changes parking bots based off whether each bot not balancing can park
            teams.forEach((team) => {
                // Whether there are already enough bots parking 
                // Also whether the team can park
                const willPark = (parkingBots < (3 - x)) && team.canPark;

                // If it does park increments how many bots are parked
                if (willPark) parkingBots ++;
            });

            // If the are enough robots that are able to balance with x other robots this will return that amount
            // It multiplies it by 10 because that is the score for teleop charge
            // Ex. if 3 were able to triple balance it will return 3.
            if (ableToBalance >= x) return x * 10 + parkingBots * 2;
            return parkingBots * 2;
        });

        // When can then take the max of their scores to find out what their max balance score is
        return Math.max(...balanceScores);
    }
    // ▄▀  █▀▄ █ █▀▄ 
    // ▀▄█ █▀▄ █ █▄▀
    
    /**
     * Generates a blank grid
     * @type {boolean[][]}
     */
    static get blankGrid () {
        // Creating an initial value to place into the reduce below
        // This just generates a 3x9 grid filled with 0s
        const blankGrid = new Array (3).fill().map(_ => {
            return new Array(9).fill(0);
        });

        return blankGrid;
    }

    /**
     * Creates a projection of what the grid will look like inside the match
     * @param {FIRSTTeam[]} teams An array of the first teams to get the projection from
     * @param {string} time What time you want this to focus one because some teams might place in certain places during auto
     * @param {Array[]} previousGrid A previous grid in case you are generating the grid for the next time segment and some nodes are already filled
     */
    static projectGrid(teams, time, previousGrid) {
        // For each time segment,

        // Getting the grids averaged grid from MatchScoutingCollection
        const averagedGrids = teams.map(team => {
            return team.matchScouting.averageGrid(time);
        });

        const { TeamProjection, AllianceProjection } = FIRSTMatch[2023];

        // Generating a array of each team's "grid picks":
        const projectedTeams = averagedGrids.map((grid, i) => new TeamProjection(grid, teams[i].number));
        // console.log({ projectedTeams });
        const projectedAlliance = new AllianceProjection(projectedTeams, previousGrid);

        // Recurses until none of the teams are placing anymore
        const recursePlacements = () => {
            // getting where the three teams are going to place next
            const placements = projectedAlliance.simulatePlaceRound();
            // placing the placements
            projectedAlliance.placeNodes(placements);

            // If the teams are still placing things this will recurse
            if (placements.length) recursePlacements();
        }

        recursePlacements();

        return projectedAlliance.grid;
        
        // Each team ranks each node based off of their grid heatmap in order of most to least,
        // The nodes they have never placed in are removed from their list
        // The nodes that have already been placed in inside previous time segments are removed from the lists as well.
        // Each team also has a counter of how many placements it has made
        // Once that counter has gone above the team's average placement amount the team stops placing
        // Combine all three lists and then if there is conflict, the team who has prioritized that node more will place it first
        // If they both have the same node with equal priority, whichever team has a longer list will pick first.
        // If that is still a tie it will just the robot with the lowest position because it shouldn't really matter
    }

    /**
     * Takes in several matchScoutings and returns an array of doubled arrays which represent grids
     * @param {MatchScouting[2023]} matchScoutings An array of match scoutings 
     * @returns {number[][][]}
     */
    static deconstructGrids(matchScoutings) {
        return matchScoutings.map(ms => {

            // Getting the grid in the format "001010110-0101011100-010010010"
            const { grid } = ms.overall;

            // Splitting the grids into rows
            const rows = grid.split("-");
            // Splitting each row into it's respective nodes
            const nodes = rows.map(row => row.split(""));

            return nodes;
        });
    }

    /**
     * Creates a new match with match data and match scouting data as well as custom methods
     * @param {Object} match The blue alliances info on the match
     * @param {Array} matchScouting An array of the different match scouting for each team
     * @param {Array[FIRSTTeam]} teams An array of the teams in the match
     */
    constructor() {
        super (...arguments);
    } 

    chargeStationState(time, alliance) {
        if (time == "endgame") time = "endGame";
        if (time != "auto" && time != "endGame") return;

        const { [alliance]: allianceScore } = this.scoreBreakdown;

        const chargeStationState = allianceScore[time + "BridgeState"];
        return chargeStationState == "Level" ? "charged" : chargeStationState == "NotLevel" ? "docked" : false;
    }

    /**
     * Gets a team's position based off their alliance
     * @param {number} team the team's number 
     * @param {string} alliance the alliance color 
     * @returns {number}
     */
    getPosition(team, alliance) {
        return this.alliances[alliance].teamKeys.indexOf("frc" + team);
    }

    /**
     * Gets whether the robot was engaged, docked, parked, or none
     * @param {number} team The team number of the bot
     * @param {string} time Whether you want auto or endgame balance data 
     * @returns {string}
     */
    getBalance(team, time) {
        if (time == "endgame") time = "endGame";
        const alliance = this.alliance(team);
        if (!alliance) return;

        // Adding one because the tba didn't use a zero-based index
        const pos = this.alliances[alliance].teamKeys.indexOf("frc" + team) + 1;
        
        const { [alliance]: allianceScore } = this.scoreBreakdown;
        if (!allianceScore) {
            // console.warn("Alliance score not found for match: ", this);
            return "No TBA Score Breakdown";
        }

        // The blue alliance will say it is docked event if it is charged so you have to return the actual state of the charge station
        const robotDocked = allianceScore[time + "ChargeStationRobot" + pos];
        return robotDocked == "Docked" ? this.chargeStationState(time, alliance) : robotDocked;
    }

    get projectedScoreBreakdown () {
        return {
            red: this.getTeamScoreBreakdown("red"),
            blue: this.getTeamScoreBreakdown("blue"),
        }
    }

    /**
     * Predicts how much one of this matches alliances is going to score
     * @param {*} alliance 
     */
    getTeamScoreBreakdown(alliance) {
        // Getting the alliance's respective team Objects
        const teams = this.alliances[alliance].teamKeys.map(tk => {
            // Taking the team keys and then removing the "frc" part of the key
            // Also converts the teamKey to a number from a string
            const teamKey = +tk.slice(3);

            // Finding the team who's team number is the same as the team key
            const team = this.teams.find(t => t.number == teamKey);
            return team;
        });

        return FIRSTMatch[2023].getProjectedScore(teams);
    }

        /*
            min
            max
            average
        */

    /**
     * Gets how many robots were balanced inside a time segment
     * @param {number} team A team number if you want to get data for the alliance the team was on (you can either use this or alliance) 
     * @param {string} alliance red or blue depending on which alliance to select (you can either use this or team) 
     * @param {string} time Whether you want auto or endgame balance data 
     * @param {number}
     */
    getBalanceAmount({ team, alliance }, time) {
        if (time == "endgame") time = "endGame";

        // Setting the alliance to the alliance if it exists or the team's alliance
        alliance = alliance || this.alliance(team);

        // returning 0 if the alliance still doesn't exist
        if (!alliance) return 0;

        const { [alliance]: allianceScore } = this.scoreBreakdown;
        
        if (!allianceScore) {
            // console.warn("Alliance score not found for match: ", this);
            return "No TBA Score Breakdown";
        }

        const pos = this.alliances[alliance].teamKeys.indexOf("frc" + team) + 1;

        // The blue alliance will say it is docked event if it is charged so you have to return the actual state of the charge station
        const teamDocked = allianceScore[time + "ChargeStationRobot" + pos];

        if (teamDocked != "Docked") return 0;
        const dockedAmount = new Array(3).fill().reduce((acc, _, i) => {
            const robotDocked = (allianceScore[time + "ChargeStationRobot" + (i + 1)] == "Docked");
            return acc + (+robotDocked);
        }, 0);

        return dockedAmount;
    }

    getParkedAmount(alliance) {
        // returning 0 if the alliance doesn't exist
        if (!alliance) return 0;

        const { [alliance]: allianceScore } = this.scoreBreakdown;
        
        if (!allianceScore) {
            // console.warn("Alliance score not found for match: ", this);
            return "No TBA Score Breakdown";
        }

        const parkedAmount = new Array(3).fill().reduce((acc, _, i) => {
            const robotParked = (allianceScore["endGameChargeStationRobot" + (i + 1)] == "Park");
            return acc + (+robotParked);
        }, 0);

        return parkedAmount;
    }

    allianceMatchScouting(color) {
        const { alliances, teamsMatchScoutingObj } = this;
        const { teamKeys } = alliances[color];

        // Removing "frc" from each key
        const teams = teamKeys.map(m => m.slice(3));

        return teams.map(team => {
            const matchScouting = teamsMatchScoutingObj[team];
            return matchScouting;
        }).filter(ms => ms); // Removing undefined values
    }

    totalMatchScoutingScore(alliance) {
        const allianceMatchScouting = this.allianceMatchScouting(alliance);

        if (allianceMatchScouting.length < 3) return "Accuracy Unknown: Not all teams were scouted for this alliance.";

        const { totalScoreWithoutLinks, rowLinks } = FIRSTYear[2023];
        // Getting all of the totalScores from each match
        // doesn't include links because those will be calculated separately
        // they are calculated separately because some links are scored by multiple different teams
        const score = allianceMatchScouting.reduce((acc, match) => 
            acc + totalScoreWithoutLinks(match),
        0);
        
        const grids = FIRSTMatch[2023].deconstructGrids(allianceMatchScouting)

        const linkScore = blankArray(3).reduce((acc, _, row) => {
            // Getting the row in the form "111011010"
            const rowString = blankArray(9).reduce((acc, _, col) => {
                const cell = grids.reduce((acc, cur) => {
                    const node = +cur[row][col];

                    // if the node has been placed in return it has been placed in
                    if (node) return node;

                    // this will be one if a different team marked the node as being placed in or 0 if none of the teams have said that they placed in it
                    return acc;
                }, 0);

                return acc + cell;
            }, "");

            const numLinks = rowLinks({ row: rowString });

            const linkPoints = 5;

            const points = numLinks * linkPoints;

            return acc + points;
        }, 0);
        
        return score + linkScore;
    }

    /**
     * Returns how many points off the matchScoutings for this match were based off the blue alliance
     * @param {string} alliance "red" or "blue" based of which alliance to check 
     * @returns {number}
     */
    getAccuracy(alliance) {
        const { scoreBreakdown } = this;
        const allianceBreakdown = scoreBreakdown[alliance];
        
        // If there is no alliance breakdown it throws a string that will be handled later
        if (!allianceBreakdown) return "Accuracy Unknown: Can't find any TBA data On this match.";
        const { totalPoints, foulPoints } = allianceBreakdown; 
        
        // Getting the total scores of that match
        const matchScoutingScore = this.totalMatchScoutingScore(alliance);

        if (typeof matchScoutingScore == "string") return matchScoutingScore;

        // Not taking foul points into consideration because we don't track them
        const total = (totalPoints - foulPoints);

        // Getting the absolute difference without taking foul points into consideration
        const difference = total - matchScoutingScore;
        const percentError = difference/total;

        return { difference, percentError };

    }
}