type FIRSTDatabaseAlliance = {
    teams: number[],
    number: number,
    comments: FIRSTAllianceComment[]
};

type FIRSTAllianceComment = {
    comment: string,
    name: string,
}

class FIRSTAlliance {
    /**
     * I don't think this works yet?
     * @param {Object} alliance 
     * @param {FIRSTEvent} event 
     */
    static fromElimination(alliance: object, event: FIRSTEvent): void {
        if (!alliance) throw new Error("Alliance must be provided");
        if (!(event instanceof FIRSTEvent)) throw new Error("Event must be provided");
    }

    /**
     * 
     * @param {Object} alliance 
     * @param {FIRSTEvent} event 
     */
    static fromDatabase(alliance: FIRSTDatabaseAlliance, event: FIRSTEvent): FIRSTAlliance {
        if (!alliance) throw new Error("Alliance must be provided");
        if (!(event instanceof FIRSTEvent)) throw new Error("Event must be provided");

        const { number, comments, teams } = alliance;

        const teamObjects = teams.map(t => event.teamsObj[t]);

        const allianceObj = new FIRSTAlliance(number, teamObjects);
        allianceObj.addComments(...comments);
        return allianceObj;
    }

    /**
     * 
     * @param {FIRSTMatch} match 
     * @returns {FIRSTAlliance[]} An array of FIRSTAlliance objects [red, blue]
     */
    static fromMatch(match: FIRSTMatch): FIRSTAlliance[] {
        if (!(match instanceof FIRSTMatch)) throw new Error("Match must be provided");
        const { teams } = match

        const redAlliance = new FIRSTAlliance('red', teams.slice(0, 3));
        const blueAlliance = new FIRSTAlliance('blue', teams.slice(3, 6)); 

        return [redAlliance, blueAlliance];
    }


    teams: FIRSTTeam[];
    captain: FIRSTTeam;
    comments: FIRSTAllianceComment[];
    number: string | number;
    /**
     * 
     * @param {Number | String} allianceName 
     * @param {FIRSTTeam[]} teams 
     */
    constructor(allianceName: number | string, teams: FIRSTTeam[]) {
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
     * @param  {...FIRSTAllianceComment} comments 
     */
    addComments(...comments: FIRSTAllianceComment[]) {
        if (comments) this.comments.push(...comments);
    }
}


class FIRSTMatchAlliance {
    /**
     * 
     * @param {FIRSTMatch} match 
     */
    static fromMatch(match: FIRSTMatch) {}
}