type DBMatchScouting = {
    trace: string;
    compLevel: string;
    matchNumber: number;
    preScoutingKey: string;
    teamNumber: number;
    pointContribution: number;
    alliance: string;
    otherTeams: MatchScouting[];
    auto?: string;
    teleop?: string;
    endgame?: string;
    overall?: string;
    scout: string;
};
type TimeSegment = {
    grid: string;
    ["Total Distance (Ft)"]: number;
    ["Velocity (ft/s)"]: number;
};
declare enum MatchScoutingParseCheckKeys {
    trace = "trace",
    auto = "auto",
    teleop = "teleop",
    endgame = "endgame",
    overall = "overall"
}
type FIRSTMatchScoutingConstructor = new (matchScoutingObj: DBMatchScouting, match?: FIRSTMatch) => MatchScouting;
declare class MatchScouting {
    static classes: {
        [year: number]: FIRSTMatchScoutingConstructor;
    };
    static decompressTrace(trace: CompressedTrace): DecompressedTrace;
    static chars: string;
    /**
     *
     * @param {String} str
     * @returns {String}
     */
    static decompress(str: string): string;
    /**
     *
     * @param {String} str
     * @returns {Array}
     */
    static parse(str: string): Point;
    static decompressAndParse(str: string): Point;
    match?: FIRSTMatch;
    trace?: DecompressedTrace;
    pointContribution: number;
    matchNumber: number;
    compLevel: string;
    teamNumber: number;
    preScoutingKey?: string;
    alliance: string;
    otherTeams: MatchScouting[];
    auto?: TimeSegment & {
        autoMobility: boolean;
    };
    teleop?: TimeSegment;
    endgame?: TimeSegment & {
        parked: boolean;
    };
    overall?: TimeSegment & {
        comments: string;
        defensiveComments: string;
        easilyDefendable: boolean;
        problemsDriving: boolean;
        robotDied: boolean;
        robotTippy: boolean;
    };
    scoutName: string;
    constructor(matchScoutingObj: DBMatchScouting, match?: FIRSTMatch);
}
type FIRSTMatchScoutingCollectionConstructor = new (...matchScoutings: MatchScouting[]) => MatchScoutingCollection;
declare class MatchScoutingCollection {
    static classes: {
        [year: number]: FIRSTMatchScoutingCollectionConstructor;
    };
    matches: MatchScouting[];
    /**
     *
     * @param  {...MatchScouting} matchScoutings MatchScouting objects to add to the collection
     */
    constructor(...matchScoutings: MatchScouting[]);
    get pointContributions(): number[];
    get averageContribution(): number;
    get maxContribution(): number | undefined;
    get minContribution(): number | undefined;
    /**
     * @returns {MatchScouting[]} Unique matches in the collection
     */
    get unique(): MatchScouting[];
    /**
     *
     * @param {MatchScouting} matchScouting MatchScouting object to add to the collection
     */
    add(matchScouting: MatchScouting): void;
    /**
     * Removes a matchScouting from this collection
     * Returns whether or not the object was removed
     * @param {MatchScouting} matchScouting MatchScouting object to remove from the collection
     * @returns {Boolean}
     */
    remove(matchScouting: MatchScouting): boolean;
}
//# sourceMappingURL=match-scouting.d.ts.map