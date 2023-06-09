// class PreScouting {
//     constructor(obj) {
//         // console.log(obj);
//         /**
//          * @type {QuestionAnswerPairs} The data for the pit scouting
//          */
//         this.questionAnswerPairs = new QuestionsAnswerPairs(obj);
//     }

//     get data () {
//         return this.questionAnswerPairs.data;
//     }

//     get hasData() {
//         return !!Object.keys(this.data).length;
//     }
// }

// class PreScoutingCollection {
//     constructor (matches) {
//         this.matches = matches.map(m => new QuestionsAnswerPairs(m));
//     }

//     get preScoutingAnswers () {
//         return this.matches.map(m => m.data);
//     }
// }