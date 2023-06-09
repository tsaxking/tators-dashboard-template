const ps_answers = new AnswerQuestions("pitScouting", undefined, { doPictureInput: true });
const prs_answers = new AnswerQuestions("preScouting", undefined, { doEventSelect: true, doMatchSelect: true, doTbaMatchSelect: true, preScouting: true, doPictureDisplay: true});
const es_answers = new AnswerQuestions("electricalScouting", undefined, {});
const ms_answers = new AnswerQuestions("mechanicalScouting", undefined, {});
const ems_answers = new AnswerQuestions("eliminationMatchScouting", undefined, { doMatchSelect: true });

const scouting= new ScoutingPage([
    prs_answers,
    ps_answers,
    es_answers,
    ms_answers,
    ems_answers,
], "Scouting");