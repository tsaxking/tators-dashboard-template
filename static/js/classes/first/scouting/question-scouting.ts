class QuestionScouting {
    data: object;
    /**
     * Takes in an object where each key is a question key and each value is the answer
     * @param {object} data an object where each key is a question key and each value is the answer
     */
    constructor (data: object) {
        /**
         * @type {object}
         */
        this.data = data;
    }

    get questions (): string[] {
        return Object.keys(this.data);
    }

    get answers (): any[] {
        return Object.values(this.data);
    }

    get hasData(): number | boolean {
        // Checks that there are over 2 questions because if there is no data
        // it will still store the name and timestamp
        return this.questions.length > 2;
    }
}