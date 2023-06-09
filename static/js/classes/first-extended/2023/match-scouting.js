MatchScouting[2023] = class extends MatchScouting {
    constructor(...args) {
        super(...args);
        // ["auto", "endgame"].forEach(time => {

        // });
    }

    get pointContribution() {
        return FIRSTYear[2023].totalScore(this);
    }

    /**
     * Gets whether the scouted robot was engaged, docked, parked, or none
     * @param {string} time Whether you want auto or endgame balance data 
     * @returns {string}
     */
    tbaBalance (time) {
        if (!this.match) return;
        return this.match.getBalance(this.teamNumber, time);
    }

    /**
     * Gets how many robots were balanced inside a time segment
     * @param {string} time Whether you want auto or endgame balance data 
     * @param {number}
     */
    tbaDockedAmount (time) {
        if (!this.match) return;
        return this.match.getBalanceAmount({ team: this.teamNumber }, time);
    }
    /**
     * Gets the scouted robot's score from balancing
     * @param {string} time Whether you want auto or endgame balance data 
     * @returns {string}
     */
    tbaBalanceScore (time) {
        if (time == "teleop") return 0; 
        const balance = this.tbaBalance(time);
        if (!balance || balance == "None" || balance == "Park") return 0;

        let score = 6;
        if (time == "auto") score += 2;
        if (balance == "charged") score += 4;
        return score;
    }

    /**
     * Returns a row of this matches grid 
     * @param {string} timeSegment Which time segment to get the row from ("auto", "teleop", or "endgame") 
     * @param {*} row 
     * @returns 
     */
    getRow  (timeSegment, row) {
        // Getting the "000000000-000000000-000000000" grid
        const grid = this[timeSegment].grid;

        if (!grid) return;

        // Finding the row within the grid for that time segment and turning it into an array
        try {
            const textRow = grid.split("-")[row];
            const gridRow = textRow.split("");
            return gridRow;
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Gets a doubled array of the grid for a time segment
     * @param {string} time Which time segment to get the grid from ("auto", "teleop", or "endgame") 
     */
    grid (time) {
        // Looping through each height and getting the row for that height
        return new Array(3).fill().map((_, i) => {
            const row = this.getRow(time, i);
            return row;
        });
    }

    get cycleTimes () {
        // Filters the trace to include only placements 
        // Removes placements with identical coordinates
        // Copy of the scouting app distance formula with some modifications
        // then divide the total time by the placements - 1
        // That's because we are counting the time between placements so we subtract 1

        const { trace } = this;

        const filteredTrace = trace.filter(line => {
            // checks that the line is an action and not points
            if (!Array.isArray(line)) {
                // Checks if the action is a placement
                const { action } = line

                return action == "placeCube"
                || action == "placeCone"
                || action == "placeHybrid";
            }
            return false;
        });

        // Copy and pasting taylor's remove duplicate matches script but editing it slightly
        // how it works is that findIndex will find the first index of the thing you are searching for
        // so if there are 2 things that meet the criteria then find index will return the first one both times
        // that means that only th first 1 will be equal to the findIndex
        // the array parameter is there because when you mutate the array it offsets 
        // some of the indices so the original array becomes no longer accurate
        // this could be in the same filter as the above filter but I just didn't want two things removing things from the array
        // especially with the index thing not always working intuitively
        const noDuplicatesTrace = filteredTrace.filter((action, i, array) => {
            const { p } = action;

            const [ x, y ] = p;

            // Finds the first index of an action with the coordinates x and y
            // Checks if the index of the first action is the same as the index of this action
            return array.findIndex(otherAction => {
                const { p: p2 } = otherAction;
                const [ x2, y2 ] = p2;

                return x == x2 && y == y2;
            }) == i;
        });

        let prevTime;

        // This could be a map but there is one point that isn't added
        // this means that it is just easier to reduce with an array accumulator
        return noDuplicatesTrace.reduce((cycles, path) => {
            const { p } = path;
            const [ x, y, time ] = p;

            // Cycles is initialized with a value of [] so you can just push stuff into it
            if (prevTime) cycles.push(roundToDigit(time - prevTime, -2));
            prevTime = time;
            return cycles;
        }, []);
    }

    get averageCycle () {
        const cycles = this.cycleTimes;
        const totalCycles = cycles.reduce((a, b) => a + b, 0); 
        const averageCycle = totalCycles/cycles.length;
        return roundToDigit(averageCycle, -2);
    }

    get autoBalanced () {
        const { getBalanceScoreMultiple } = FIRSTYear[2023];
        const balancePoints = getBalanceScoreMultiple(["auto"])(['level'])(true)(this);

        // If balance points is 0 this will return !!0 which is false
        // if balance points is 12 this will return !!12 which is true
        return !!balancePoints;
    }

    /**
     * How many points off the matchScoutings for this team's alliance were based off the blue alliance
     * @type {number}
     */
    get accuracy () {
        // if the comp level indicates that the match was redone then we return because I'm not sure that the blue alliance tracks the match's data
        if (this.compLevel == "re") return "Accuracy Unknown: This match was redone and there is no TBA data on redoes.";
        if (this.compLevel == "pr") return "Accuracy Unknown: TBA has no practice match data.";

        // getting the tba info on the match
        const { match } = this;

        // returning a message if there is no match since there isn't really a way to check the accuracy if the blue alliance has no match data
        if (!match) return "Accuracy Unknown: Can't find Any TBA on this match.";

        const alliance = match.alliance(this.teamNumber);
        if (alliance) return match.getAccuracy(alliance);

        // returning if there is no match since there isn't really a way to check the accuracy if the blue alliance has no match data
        return "Accuracy Unknown: Can't find Any TBA on this match.";
    }
};
