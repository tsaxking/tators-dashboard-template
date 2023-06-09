class QuestionScouting {
    /**
     * Takes in an object where each key is a question key and each value is the answer
     * @param {Object} data an object where each key is a question key and each value is the answer
     */
    constructor (data) {
        /**
         * @type {Object}
         */
        this.data = data;
    }

    get questions () {
        return Object.keys(this.data);
    }

    get answers () {
        return Object.values(this.data);
    }

    get hasData() {
        // Checks that there are over 2 questions because if there is no data
        // it will still store the name and timestamp
        return this.questions.length && this.questions.length > 2;
    }
}