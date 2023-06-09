class TatorInfo {
    static singleAnswerScoutingTypes = ['pitScouting', 'electricalScouting', 'mechanicalScouting'];
    static multipleAnswerScoutingTypes = ['preScouting', 'eliminationMatchScouting'];
    constructor(obj) {
        Object.assign(this, obj);

        this.heatmap = this.heatmap ? new Heatmap(JSON.parse(this.heatmap)) : null;

        TatorInfo.singleAnswerScoutingTypes.forEach(scoutingType => {
            const { [scoutingType]: originalData } = this;
            const scouting = originalData ? JSON.parse(originalData) : {};
            this[scoutingType] = new QuestionScouting(scouting);
        });
        TatorInfo.multipleAnswerScoutingTypes.forEach(scoutingType => {
            const { [scoutingType]: originalData } = this;
            const scouting = originalData ? JSON.parse(originalData) : [];
            this[scoutingType] = new QuestionScoutingCollection(scouting);
        })
    }
}