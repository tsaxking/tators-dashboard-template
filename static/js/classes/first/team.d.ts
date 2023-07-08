type TBATeam = {
    team_number: number;
    heatmap: string;
};
declare class FIRSTTeam {
    /**
     * Builds a FIRSTTeam object from a FIRSTEvent and a tba Team object
     * @param {FIRSTEvent} event Event the team was in
     * @param {Object} tbaInfo tba Team object
     * @returns {FIRSTTeam} The team
     */
    static build(event: FIRSTEvent, tbaInfo: {
        heatmap?: string;
    }, tatorInfo: DBTatorInfo): Promise<FIRSTTeam>;
    tatorInfo: TatorInfo;
    event: FIRSTEvent;
    info: {
        teamNumber: number;
        nickname: string;
    };
    number: number;
    matches: FIRSTMatch[];
    matchScouting: MatchScoutingCollection;
    heatmap: null;
    /**
     *
     * @param {FIRSTEvent} event
     * @param {Object} tbaInfo tba Team object
     */
    constructor(event: FIRSTEvent, tbaInfo: object, tatorInfo: TatorInfo);
    /**
     * @returns {Object} Object of all the matches in the team (keyed by their tba match key)
     */
    get matchesObj(): {
        [matchKey: string]: FIRSTMatch;
    };
    /**
     * Adds matches to the team
     * @param  {...FIRSTMatch} matches
     */
    addMatches(...matches: FIRSTMatch[]): void;
    /**
     * Adds match scouting data to the team
     * @param  {...MatchScouting} scoutings scoutings to add
     */
    addMatchScouting(...scoutings: DBMatchScouting[]): void;
    get frameDimensions(): string;
    get dimensionNumbers(): string[];
}
//# sourceMappingURL=team.d.ts.map