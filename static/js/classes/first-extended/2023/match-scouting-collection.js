MatchScoutingCollection[2023] = class extends MatchScoutingCollection {
    averageGrid (time) {
        // Creating an initial value to place into the reduce below
        // This just generates a 3x9 grid filled with 0s
        const blankGrid = new Array (3).fill().map(_ => {
            return new Array(9).fill(0);
        });
        
        // Returns the blank grid if there are no matches
        if (!Array.isArray(this.matches)) return blankGrid;

        // Getting the length so averaging is easier
        const { length } = this.matches;

        // Returns a blank grid if the matches are empty
        if (!length) return blankGrid;
        
        // Using a reduce function to add placements to a new blank grid
        return this.matches.reduce((acc, match) => {
            const grid = match.grid(time);

            // Adding each item of the accumulator to each item of the grid
            return grid.map((row, i) => {
                return row.map((col, j) => {
                    // Dividing the value by the match length
                    // This averages the grids when you add them all together
                    // This is because of the distributive property => (a + b)/2 = a/2 + b/2
                    const averagedCol = col/length;
                    return averagedCol + acc[i][j];
                })
            });
        }, blankGrid);
    }

    /**
     * Gets the percent of matches where the team goes auto mobility
     * @type {number}
     */
    get averageMobility () {
        const { length } = this.matches;
        // Returning 0 if there are no matches to prevent division by 0 error
        if (!length) return 0;

        return this.matches.reduce((acc, match) => {
            const { autoMobility } = match.auto;

            // Returning auto mobility as a number after converting it to a bool if it was undefined
            return acc + (+!!autoMobility);
        }, 0)/length;
    }

    get contributions () {
        return this.matches.map(m => {
            return m.pointContribution;
        });
    }

    get averageContribution () {
        const { contributions } = this;
        if (!contributions.length) return 0;

        return contributions.reduce((a, b) => a + b)/contributions.length;
    }

    get maxContribution () {
        const { contributions } = this;
        if (!contributions.length) return 0;
        return Math.max(...contributions);
    }

    get minContribution () {
        const { contributions } = this;
        if (!contributions.length) return 0;
        return Math.min(...contributions);
    }

    get length () {
        return this.matches.length;
    }

    get autoChargeAmount () {
        const autoCharged = this.matches.filter(m => m.autoBalanced);

        return autoCharged.length;
    }

    get autoChargeFrequency () {
        return this.autoChargeAmount/this.length;
    }

    get autoChargedPercentage () {
        const { autoChargeFrequency } = this;
        return Math.round(autoChargeFrequency * 100);
    }
}