class QuestionScoutingCollection {
    matches: QuestionScouting[];
    constructor (matches: object[]) {
        this.matches = matches.map(m => new QuestionScouting(m));
    }

    get data() {
        return this.matches.map(m => m.data);
    }

    get uniqueQuestions(): string[] {
        const allKeys = this.matches.map(m => {
            return m.questions;
        }).flat();

        return allKeys.reduce((acc: string[], key: string) => {
            if (!acc.includes(key)) acc.push(key);
            return acc;
        }, []);
    }
}