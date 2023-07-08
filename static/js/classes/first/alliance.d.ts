type FIRSTDatabaseAlliance = {
    teams: number[];
    number: number;
    comments: FIRSTAllianceComment[];
};
type FIRSTAllianceComment = {
    comment: string;
    name: string;
};
declare class FIRSTAlliance {
    /**
     * I don't think this works yet?
     * @param {Object} alliance
     * @param {FIRSTEvent} event
     */
    static fromElimination(alliance: object, event: FIRSTEvent): void;
    /**
     *
     * @param {Object} alliance
     * @param {FIRSTEvent} event
     */
    static fromDatabase(alliance: FIRSTDatabaseAlliance, event: FIRSTEvent): FIRSTAlliance;
    /**
     *
     * @param {FIRSTMatch} match
     * @returns {FIRSTAlliance[]} An array of FIRSTAlliance objects [red, blue]
     */
    static fromMatch(match: FIRSTMatch): FIRSTAlliance[];
    teams: FIRSTTeam[];
    captain: FIRSTTeam;
    comments: FIRSTAllianceComment[];
    number: string | number;
    /**
     *
     * @param {Number | String} allianceName
     * @param {FIRSTTeam[]} teams
     */
    constructor(allianceName: number | string, teams: FIRSTTeam[]);
    /**
     *
     * @param  {...FIRSTAllianceComment} comments
     */
    addComments(...comments: FIRSTAllianceComment[]): void;
}
declare class FIRSTMatchAlliance {
    /**
     *
     * @param {FIRSTMatch} match
     */
    static fromMatch(match: FIRSTMatch): void;
}
//# sourceMappingURL=alliance.d.ts.map