declare class QuestionScouting {
    data: object;
    /**
     * Takes in an object where each key is a question key and each value is the answer
     * @param {object} data an object where each key is a question key and each value is the answer
     */
    constructor(data: object);
    get questions(): string[];
    get answers(): any[];
    get hasData(): number | boolean;
}
//# sourceMappingURL=question-scouting.d.ts.map