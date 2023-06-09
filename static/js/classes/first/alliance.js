class FIRSTAlliance {
    /**
     * 
     * @param {Object} alliance 
     * @param {FIRSTEvent} event 
     */
    static fromElimination(alliance, event) {
        if (!alliance) throw new Error("Alliance must be provided");
        if (!(event instanceof FIRSTEvent)) throw new Error("Event must be provided");
    }

    /**
     * 
     * @param {Object} alliance 
     * @param {FIRSTEvent} event 
     */
    static fromDatabase(alliance, event) {
        if (!alliance) throw new Error("Alliance must be provided");
        if (!(event instanceof FIRSTEvent)) throw new Error("Event must be provided");
        const teams = alliance.teams.map(t => event.teamsObj[t]);

        const a = new FIRSTAlliance(alliance.number, teams);
        a.addComments(...alliance.comments);
        return a;
    }

    /**
     * 
     * @param {FIRSTMatch} match 
     * @returns {FIRSTAlliance[]} An array of FIRSTAlliance objects [red, blue]
     */
    static fromMatch(match) {
        if (!(match instanceof FIRSTMatch)) throw new Error("Match must be provided");
        const { teams } = match

        const [redCaptain, red2, red3, blueCaptain, blue2, blue3] = teams;
        const redAlliance = new FIRSTAlliance('red', [redCaptain, red2, red3]);
        const blueAlliance = new FIRSTAlliance('blue', [blueCaptain, blue2, blue3]);

        return [redAlliance, blueAlliance];
    }



    /**
     * 
     * @param {Number | String} allianceName 
     * @param {FIRSTTeam[]} teams 
     */
    constructor(allianceName, teams) {
        if (!allianceName) throw new Error("Alliance number must be provided");
        teams.forEach(t => {
            if (!(t instanceof FIRSTTeam)) throw new Error("Alliance must be composed of teams");
        });

        /**
         * @type {FIRSTTeam[]} The teams in the alliance
         */
        this.teams = teams;

        /**
         * @type {FIRSTTeam} The captain of the alliance
         */
        this.captain = teams[0];

        /**
         * @type {FIRSTTeam} The first pick of the alliance
         */
        this.comments = [];

        /**
         * @type {Number} The alliance number
         */
        this.number = allianceName;
    }

    /**
     * 
     * @param  {...Object} comments 
     */
    addComments(...comments) {
        if (comments) this.comments.push(...comments);
    }
}


class FIRSTMatchAlliance {
    /**
     * 
     * @param {FIRSTMatch} match 
     */
    static fromMatch(match) {}
}