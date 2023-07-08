type QuestionScoutingConstructor = (new (data: object) => any) | (new (data: object[]) => any);
declare enum ScoutingTypeSingle {
    pitScouting = "pitScouting",
    electricalScouting = "electricalScouting",
    mechanicalScouting = "mechanicalScouting"
}
declare enum ScoutingTypeMultiple {
    preScouting = "preScouting",
    eliminationMatchScouting = "eliminationMatchScouting"
}
type DBTatorInfo = {
    active: number;
    dashboardComments: null | string;
    electricalScouting: null | string;
    eliminationMatchScouting: null | string;
    eventKey: string;
    heatmap: null | string;
    heatmap2: null | string;
    mechanicalScouting: null | string;
    number: number;
    picture: null | string;
    pitScouting: null | string;
    preScouting: null | string;
};
declare class TatorInfo {
    static singleAnswerScoutingTypes: ScoutingTypeSingle[];
    static multipleAnswerScoutingTypes: ScoutingTypeMultiple[];
    heatmap?: Heatmap;
    pitScouting: QuestionScouting;
    electricalScouting: QuestionScouting;
    mechanicalScouting: QuestionScouting;
    eliminationMatchScouting: QuestionScoutingCollection;
    preScouting: QuestionScoutingCollection;
    constructor(obj: DBTatorInfo);
}
//# sourceMappingURL=tator-info.d.ts.map