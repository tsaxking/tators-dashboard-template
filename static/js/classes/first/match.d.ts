type TBAAlliance = {
    teamKeys: string[];
};
type TBAAlliances = {
    red: TBAAlliance;
    blue: TBAAlliance;
};
type TBAMatch = {
    alliances?: TBAAlliances;
    compLevel: string;
    matchNumber: number;
};
type FIRSTMatchConstructor = new (tbaMatch: object, event: FIRSTEvent, teams: Array<FIRSTTeam>) => FIRSTMatch;
declare class FIRSTMatch {
    static classes: {
        [year: number]: FIRSTMatchConstructor;
    };
    key: any;
    /**
     * Builds a FIRSTMatch object from the TBA API
     * @param {FIRSTEvent} event FIRSTEvent object of the event the match is in
     * @param {Object} tbaMatch The TBA match object
     */
    static build(event: FIRSTEvent, tbaMatch: object): Promise<FIRSTMatch | undefined>;
    event: FIRSTEvent;
    info: TBAMatch;
    teams: FIRSTTeam[];
    winningAlliance?: string;
    alliances?: TBAAlliances;
    matchNumber: number;
    compLevel: string;
    /**
     *
     * @param {Object} tbaMatch The TBA match object
     * @param {FIRSTEvent} event FIRSTEvent object of the event the match is in
     * @param {Array[FIRSTTeam]} teams An array of FIRSTTeams in the match
     */
    constructor(tbaMatch: object | undefined, event: FIRSTEvent, teams?: Array<FIRSTTeam>);
    /**
     * @type {Object} An object of FIRSTTeam objects with the team number as the key
     */
    get teamsMatchScoutingObj(): {
        [n: number]: MatchScouting;
    };
    /**
     * @type {Array[FIRSTTeamMatchScouting]} An array of FIRSTTeamMatchScouting objects
     */
    get teamsMatchScouting(): MatchScouting[];
    /**
     *
     * @param {Number} number The team number
     */
    hasTeam(number: number): boolean;
    /**
     * Gets which alliance a team is on
     * @param {number} number The number of the team
     * @returns {string}
     */
    alliance(number: number): string | boolean;
    /**
     * @returns {Object} An object of the teams in the match (keyed by alliance color)
     */
    get teamObj(): {
        [allianceAndNumber: string]: FIRSTTeam | undefined;
    } | undefined;
    /**
     * returns the alliance the team is on
     */
    get winner(): string;
}
//# sourceMappingURL=match.d.ts.map