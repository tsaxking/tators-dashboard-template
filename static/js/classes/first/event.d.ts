type FIRSTEventProperties = {
    field?: string[];
    hidePr?: boolean;
};
declare enum ScoutingType {
    pitScouting = "pitScouting",
    preScouting = "preScouting",
    electricalScouting = "electricalScouting",
    eliminationMatchScouting = "eliminationMatchScouting",
    mechanicalScouting = "mechanicalScouting"
}
declare enum QuestionTypes {
    pitScouting = "pitScoutingQuestions",
    preScouting = "preScoutingQuestions",
    electricalScouting = "electricalScoutingQuestions",
    eliminationMatchScouting = "eliminationMatchScoutingQuestions",
    mechanicalScouting = "mechanicalScoutingQuestions"
}
type TBAEvent = {};
declare class FIRSTEvent {
    info: {
        year: number;
        key: string;
    };
    teams: FIRSTTeam[];
    matches: FIRSTMatch[];
    properties: FIRSTEventProperties;
    field: FIRSTField;
    year: FIRSTYear;
    built?: boolean;
    preScoutingQuestions: any;
    pitScoutingQuestions: any;
    electricalScoutingQuestions: any;
    mechanicalScoutingQuestions: any;
    eliminationMatchScoutingQuestions: any;
    /**
     *
     * @param {Object} tbaInfo The blue alliance event object
     * @param {Object} eventProperties Properties
     * @param {FIRSTYear} year
     */
    constructor(tbaInfo: TBAEvent, eventProperties: FIRSTEventProperties, year: FIRSTYear);
    get matchesObj(): {
        [matchKey: string]: FIRSTMatch;
    };
    get teamsObj(): {
        [teamNumber: number]: FIRSTTeam;
    };
    /**
     * Builds the event from the TBA event keys
     */
    build(): Promise<FIRSTEvent | undefined>;
    /**
     *  Adds teams to the event
     * @param  {...FIRSTTeam} teams Teams to add to the event
     */
    addTeams(...teams: FIRSTTeam[]): void;
    /**
     * Adds matches to the event
     * @param  {...FIRSTMatch} matches Matches to add to the event
     */
    addMatches(...matches: FIRSTMatch[]): void;
    addMatchScouting(matchScouting: DBMatchScouting): Promise<undefined>;
    get highestScore(): number;
    get newTeamSelect(): any;
    get newMatchSelect(): any;
}
//# sourceMappingURL=event.d.ts.map