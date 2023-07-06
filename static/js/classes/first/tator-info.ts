type QuestionScoutingConstructor = (new (data: object) => any) | (new (data: object[]) => any);

enum ScoutingTypeSingle {
    pitScouting = ScoutingType.pitScouting,
    electricalScouting = ScoutingType.electricalScouting,
    mechanicalScouting = ScoutingType.mechanicalScouting,
}

enum ScoutingTypeMultiple {
    preScouting = ScoutingType.preScouting,
    eliminationMatchScouting = ScoutingType.eliminationMatchScouting,
}

type DBTatorInfo = {
    active: number,
    dashboardComments: null | string,
    electricalScouting: null | string,
    eliminationMatchScouting: null | string,
    eventKey: string,
    heatmap: null | string,
    heatmap2: null | string,
    mechanicalScouting: null | string,
    number: number,
    picture: null | string,
    pitScouting: null| string,
    preScouting: null | string,
}

class TatorInfo {
    static singleAnswerScoutingTypes: ScoutingTypeSingle[] = [
        ScoutingTypeSingle.pitScouting,
        ScoutingTypeSingle.electricalScouting,
        ScoutingTypeSingle.mechanicalScouting,
    ];
    static multipleAnswerScoutingTypes: ScoutingTypeMultiple[] = [
        ScoutingTypeMultiple.preScouting,
        ScoutingTypeMultiple.eliminationMatchScouting,
    ];

    heatmap?: Heatmap;
    pitScouting!: QuestionScouting;
    electricalScouting!: QuestionScouting;
    mechanicalScouting!: QuestionScouting;
    eliminationMatchScouting!: QuestionScoutingCollection;
    preScouting!: QuestionScoutingCollection;

    constructor(obj: DBTatorInfo) {
        const { heatmap } = obj;

        this.heatmap = heatmap ? new Heatmap(JSON.parse(heatmap)) : undefined;

        const createScoutingObjects = (Class: QuestionScoutingConstructor, defaultData: any, scoutingType: ScoutingTypeSingle | ScoutingTypeMultiple) => {
            const originalData = obj[scoutingType];
            const scouting = originalData ? JSON.parse(originalData) : defaultData;
            this[scoutingType] = new Class(scouting);
        }

        TatorInfo.singleAnswerScoutingTypes.forEach(s => createScoutingObjects(QuestionScouting, {}, s));
        TatorInfo.multipleAnswerScoutingTypes.forEach(s => createScoutingObjects(QuestionScoutingCollection, [], s));
    }
}