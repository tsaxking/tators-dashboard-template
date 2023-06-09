class QuestionScoutingCollection {
    constructor (matches) {
        this.matches = matches.map(m => new QuestionScouting(m));
    }

    get data () {
        return this.matches.map(m => m.data);
    }

    get uniqueQuestions () {
        const allKeys = this.matches.map(m => {
            return m.questions;
        }).flat();
        return allKeys.reduce((acc, key) => {
            if (!acc.includes(key)) acc.push(key);
            return acc;
        }, []);
    }
}