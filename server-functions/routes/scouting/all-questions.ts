// "use strict";
import { Router } from 'express';
import { DB } from '../../databases';
// import { adminRoleTest } from '../../structure/sessions';
import { permissions } from '../../middleware/permissions';
import { requestFromTBA } from '../../structure/tba-request';
import { saveUpload, fileStream } from '../../files';
import stream from 'fs';
import path from 'path';
import { serverLog } from "../../structure/logging";

const uuid = require('uuid').v4;

const router = Router();

const camelCaseToNormalCasing = (str: string) => str.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

const initialData = {
    // Object freeze will make an array read only
    preScouting: Object.freeze([]),
    electricalScouting: Object.freeze({}),
    pitScouting: Object.freeze({}),
    mechanicalScouting: Object.freeze({}),
    eliminationMatchScouting: Object.freeze([]),

};

enum AllowedColumnNames {
    preScouting = 'preScouting',
    electricalScouting = 'electricalScouting',
    pitScouting = 'pitScouting',
    mechanicalScouting = 'mechanicalScouting',
    eliminationMatchScouting = 'eliminationMatchScouting',
}
type Question = {
    key: string,
};

type Section = {
    questions: Question[],
};

type MatchInfo = {
    eventKey: string,
    matchNumber: number,
    teamNumber: number,
    scoutedEvent?: string
    compLevel: string,
}

const initialQuestions = {
    pitScouting: [
        {
            "title": "Robot Structure",
            "questions": [
                {
                    "question": "Ask what they are most proud of about their robot. ",
                    "key": "proudof",
                    "description": "This is just an icebreaker to connect with them personally and get them excited to talk to you.",
                    "type": "textarea",
                    "small": "on",
                    "id": "61f2a244-fc86-4be1-ad09-6106d313c802",
                    "options": {
                        "radio": [],
                        "checkbox": [],
                        "select": []
                    }
                },
                {
                    "question": "What's their drive train?",
                    "key": "drivetrain",
                    "description": "This has limited options so we can use the data for calculations. If you have other observations or information add them to the next question.",
                    "type": "select",
                    "small": "on",
                    "id": "61f2a244-fc86-4be1-ad09-6106d313c805",
                    "options": {
                        "radio": [],
                        "checkbox": [],
                        "select": [
                            {
                                "text": "Tank Drive",
                                "order": 0
                            },
                            {
                                "text": "Swerve",
                                "order": 1
                            },
                            {
                                "text": "Mechanum",
                                "order": 2
                            },
                            {
                                "text": "Octocanum",
                                "order": 3
                            },
                            {
                                "text": "H-Omni",
                                "order": 4
                            }
                        ]
                    }
                },
                {
                    "question": "Describe their drive train.",
                    "key": "drivetrain details",
                    "description": "Westcoast? If tank is it belt driven or chain driven?",
                    "type": "textarea",
                    "small": "on",
                    "id": "61f2a244-fc86-4be1-ad09-6106d313c806",
                    "options": {
                        "radio": [],
                        "checkbox": [],
                        "select": []
                    }
                },
                {
                    "question": "Frame width",
                    "key": "Width",
                    "description": "without bumpers, in inches, use decimals and not fractions",
                    "type": "number",
                    "small": "on",
                    "id": "61f2a244-fc86-4be1-ad09-6106d313c803",
                    "options": {
                        "radio": [],
                        "checkbox": [],
                        "select": []
                    }
                },
                {
                    "question": "Frame Length",
                    "key": "Length",
                    "description": "without bumpers, in inches, use decimals and not fractions",
                    "type": "number",
                    "small": "on",
                    "id": "61f2a244-fc86-4be1-ad09-6106d313c804",
                    "options": {
                        "radio": [],
                        "checkbox": [],
                        "select": []
                    }
                }
            ]
        }
    ],

    electricalScouting: [{
        "title": "General Electrical",
        "questions": [
            {
                "question": "Overall Electrical Rating",
                "key": "El_OverallRating",
                "description": "Scale of 1-5 (1 is worst, 5 is best, 3 is average), what is the overall rating of this teams electrical system?",
                "type": "number",
                "small": "on",
                "id": "a20e0ac6-7732-4cf8-a09d-9d6c3e9a1a9a",
                "options": {
                    "radio": [],
                    "checkbox": [],
                    "select": []
                }
            }
        ]
    }],

    mechanicalScouting: [
        {
            "title": "General Mechanical",
            "questions": [
                {
                    "question": "Overall Mechanical Rating",
                    "key": "Me_OverallRating",
                    "description": "Scale of 1-5 (1 is worst, 5 is best, 3 is average), what is the overall rating of this teams mechanical systems?",
                    "type": "number",
                    "small": "on",
                    "id": "a20e0ac6-7732-4cf8-a09d-9d6c3e9a1a9b",
                    "options": {
                        "radio": [],
                        "checkbox": [],
                        "select": []
                    }
                }
            ]
        }
    ],
    preScouting: undefined,
    eliminationMatchScouting: undefined,
}

const allowedColumnNames = Object.keys(initialData);

router.post('/get-sections', async (req, res, next) => {
    const { eventKey, type } = req.body as { 
        eventKey: string,
        type: AllowedColumnNames
    };
    if (!allowedColumnNames.includes(type)) {
        console.error(type + " is not an allowed column name");
        return;
    }

    const query = `
        SELECT ${type}
        FROM Events
        WHERE eventKey = ?
    `;

    const result = await DB.get(query, [eventKey]);
    const initialQuestion = initialQuestions[type] || [];
    if (!result) return res.json(initialQuestion);

    res.json(JSON.parse(result[type] ? result[type] : JSON.stringify(initialQuestion)));

    next();
});

router.post('/save-sections', permissions('editScoutingQuestions'), async (req, res, next) => {
    const { eventKey, sections, type } = req.body as {
        eventKey: string,
        sections: Array<Section>,
        type: string,
    };
    if (!allowedColumnNames.includes(type)) {
        console.error(type + " is not an allowed column name");
        return;
    }

    let keys = type == "preScouting" ? [
        'matchInfo',
        'scoutName',
        'timestamp'
    ] : [],
        test = true;

    const duplicateKeys: string[] = [];

    sections.forEach(s => {
        const { questions } = s;

        questions.forEach(q => {
            if (keys.includes(q.key)) {
                test = false;
                duplicateKeys.push(q.key);
            }
            keys.push(q.key);
        });
    });

    if (duplicateKeys.length) {
        res.json({
            status: 'danger',
            msg: 'Duplicate question key found: ' + duplicateKeys,
            title: 'Error'
        });

        return next();
    }

    if (!test) {
        res.json({
            status: 'danger',
            msg: 'Duplicate question key found',
            title: 'Error'
        });

        return next();
    };

    const query = `
        UPDATE Events
        SET ${type} = ?
        WHERE eventKey = ?
    `;

    await DB.run(query, [JSON.stringify(sections, null, 2), eventKey]);

    const normalName = camelCaseToNormalCasing(type);
    res.json({
        status: 'success',
        msg: `${normalName} sections saved`,
        title: normalName,
    });

    serverLog(req, `${normalName} sections saved`, {
        type: 'scout-questions'
    });

    req.io.emit("new-questions", { eventKey, sections, type });

    next();
});

const findTeamQuery = `
    SELECT *
    FROM Teams
    WHERE number = ?
        AND eventKey = ?
        AND active = 1
`;

const findTeam = async (teamNumber: number, eventKey: string) => await DB.get(findTeamQuery, [teamNumber, eventKey]);

async function saveObjectScouting(req, res, next) {
    const { answers, eventKey, teamNumber, type } = req.body;

    if (!allowedColumnNames.includes(type)) {
        res.status(200).json({
            status: 'danger',
            msg: 'Invalid type: Contact site administrator',
            title: 'Error'
        });
        return next();
    }

    const getQuery = `
        SELECT ${type}
        FROM Teams
        WHERE number = ?
            AND eventKey = ?
            AND active = 1
    `;

    const previousAnswerJson = (await DB.get(getQuery, [teamNumber, eventKey]))[type];
    const previousAnswers = previousAnswerJson ? JSON.parse(previousAnswerJson) : {};
    // Removing blank entires so that they won't override existing data
    Object.entries(answers).forEach(([key, value]) => {
        if (value === "" || value === undefined || value === "undefined") delete answers[key];
    });

    // Combines the answers so if an answer isn't there it won't remove the previous one
    const mergedAnswers = previousAnswers ? Object.assign(previousAnswers, answers) : answers;

    const team = findTeam(teamNumber, eventKey);
    // const team = await DB.get(findTeam, [teamNumber, eventKey]);

    if (!team) {
        res.status(200).json({
            status: 'danger',
            msg: 'Team not found: Contact site administrator',
            title: 'Error'
        });

        return next();
    }

    const saveQuery = `
        UPDATE Teams
        SET ${type} = ?
        WHERE number = ?
            AND eventKey = ?
    `;

    await DB.run(saveQuery, [JSON.stringify(mergedAnswers), teamNumber, eventKey]);

    req.io.emit("new-answer", { type, answer: mergedAnswers, teamNumber, eventKey });

    res.status(200).json({
        status: 'success',
        msg: `${camelCaseToNormalCasing(type)} answers saved`,
        title: camelCaseToNormalCasing(type),
    });

    next();
}

async function saveMatchArrayScouting(req: any, res: any, next: Function) {
    // Pre scouting
    const {
        answers,
        eventKey,
        teamNumber,
        scoutedEvent,
        matchNumber,
        compLevel,
        type,
    } = req.body;

    if (!allowedColumnNames.includes(type)) {
        res.status(500).json({
            status: 'danger',
            msg: 'Invalid type: Contact site administrator',
            title: 'Error'
        });

        return next();
    }

    const team = await findTeam(teamNumber, eventKey);

    if (!team) {
        res.status(500).json({
            status: 'danger',
            msg: 'Team not found: Contact site administrator',
            title: 'Error'
        });
        return next();
    }

    const matches = JSON.parse(team[type] ? team[type] : '[]') as { matchInfo: MatchInfo }[];

    const match = matches.find(m => {
        const { matchInfo } = m;
        if (!matchInfo) return false;
        return (
            m.matchInfo.matchNumber == matchNumber &&
            m.matchInfo.teamNumber == teamNumber &&
            (!scoutedEvent || m.matchInfo.scoutedEvent == scoutedEvent) &&
            m.matchInfo.compLevel == compLevel
        );
    });

    req.io.emit("new-answer", { type, answer: answers, teamNumber, compLevel, matchNumber, eventKey, scoutedEvent });

    if (match) {
        answers.matchInfo = match.matchInfo;
        // replace match
        matches.splice(matches.indexOf(match), 1, answers);

        const query = `
            UPDATE Teams
            SET ${type} = ?
            WHERE number = ?
                AND eventKey = ?
        `;

        await DB.run(query, [JSON.stringify(matches, null, 2), teamNumber, eventKey]);

        res.status(200).json({
            status: 'success',
            msg: 'Answers saved',
            title: camelCaseToNormalCasing(type),
        });

        return next();
    } else {
        const query = `
            UPDATE Teams
            SET ${type} = ?
            WHERE number = ?
                AND eventKey = ?
        `;
        answers.matchInfo = {
            matchNumber,
            teamNumber,
            compLevel,
        }

        if (scoutedEvent) answers.matchInfo.scoutedEvent = scoutedEvent;
        matches.push(answers);

        await DB.run(query, [
            JSON.stringify(matches),
            teamNumber,
            eventKey
        ]);

        res.status(500).json({
            status: 'success',
            msg: camelCaseToNormalCasing(type) + ' answers saved',
            title: camelCaseToNormalCasing(type),
        });

        next();
    }
}

router.post('/save-answers', async (req, res, next) => {
    const { type } = req.body;

    if (["pitScouting", "electricalScouting", "mechanicalScouting"].includes(type)) saveObjectScouting(req, res, next);
    else if (["preScouting", "eliminationMatchScouting"].includes(type)) saveMatchArrayScouting(req, res, next);
    else {
        return res.status(500).json({
            status: 'danger',
            msg: 'Invalid type',
            title: 'Error'
        });
    }

    serverLog(req, type + ' answers saved', {
        type: 'scout-answers'
    });

    next();
});


router.post('/get-teams', async (req, res, next) => {
    const { eventKey, teams, type } = req.body as {
        eventKey: string,
        teams: number[],
        type: AllowedColumnNames
    };
    if (!allowedColumnNames.includes(type)) {
        res.json({
            status: 'danger',
            msg: 'Invalid type',
            title: 'Error'
        });

        return next();
    }

    const initialDataForType = initialData[type];
    const _teams = teams.map(t => {
        return {
            number: t,
            [type]: initialDataForType as object,
        };
    });

    let query = `
        SELECT ${type}
        FROM Teams
        WHERE number = ?
        AND active = 1
    `;
    const isPreScouting = type == 'preScouting';
    if (isPreScouting) query += `AND eventKey LIKE ?`;
    else query += `AND eventKey = ?`;

    const year = eventKey.slice(0, 4);
    await Promise.all(_teams.map(async team => {
        // console.log('Searching for: ', team.number);
        if (isPreScouting) {
            const results = await DB.all(query, [team.number, `%${year}%`]) as {
                [key: string]: any
            }[];
            const combinedResults = results.map(result => {
                const parsed = JSON.parse(result ? result[type] : JSON.stringify(initialDataForType));
                return parsed;
            }).flat();

            team[type] = combinedResults;
        } else {
            const result = await DB.get(query, [team.number, eventKey]);
            team[type] = JSON.parse(result ? result[type] : JSON.stringify(initialDataForType)) as object;
        }
    }));

    res.json(_teams);

    next();
});

router.post('/get-questions', async (req, res, next) => {
    const { eventKey, type } = req.body;
    if (!allowedColumnNames.includes(type)) {
        res.json({
            msg: 'Invalid type',
            title: 'Error',
            status: 'danger'
        });

        return next();
    }

    const query = `
        SELECT ${type}
        FROM Events
        WHERE eventKey = ?
    `;

    try {
        let { [type]: info } = await DB.get(query, [eventKey]) as {
            [type: string]: string
        };

        info = info ? info : '[]';
        const parsedInfo = JSON.parse(info) as Section[];
        let questions: Question[] = [];
        parsedInfo.forEach(section => { questions = [...questions, ...section.questions] });

        res.json(questions);
    } catch (e) {
        console.error(e);
        res.json({
            msg: `No ${camelCaseToNormalCasing(type)} data found`,
            title: 'Error',
            status: 'danger'
        });
    }

    next();
});

// These are preScout only

router.post('/find-match', async (req, res, next) => {
    const {
        eventKey,
        teamNumber,
        matchNumber,
        compLevel,
        scoutedEvent,
        type
    } = req.body;
    if (!allowedColumnNames.includes(type)) {
        res.json({
            msg: 'Invalid type',
            title: 'Error',
            status: 'danger'
        });

        return next();
    }

    const query = `
        SELECT ${type}
        FROM Teams
        WHERE number = ?
            AND eventKey = ?
            AND active = 1
    `;

    const result = await DB.get(query, [+teamNumber, eventKey]);

    if (!result) {
        res.json({
            status: 'danger',
            msg: 'Team not found',
            title: 'Error'
        });
    } else {
        const info = JSON.parse(result[type]) as { matchInfo: MatchInfo}[];

        const event = info.find(e => {
            const { matchInfo } = e;
            if (!matchInfo) return false;
            return (
                matchInfo.eventKey == scoutedEvent &&
                matchInfo.matchNumber == matchNumber &&
                matchInfo.compLevel == compLevel
            );
        });

        res.json({
            exists: event ? true : false,
            answers: event ? event : {}
        });
    }

    return next();
});

// These are pitScouting only
router.post('/save-picture', fileStream({
    extensions: [
        'jpg',
        'jpeg',
        'png',
        'gif',
        "PNG"
    ]
}), async (req, res, next) => {
    try {
        const {
            'x-custom-teamnumber': teamNumber,
            'x-custom-eventkey': eventKey,
            'x-custom-type': type
        } = req.headers

        const { file } = req;
        if (!allowedColumnNames.includes(type as string)) {
            res.json({
                status: 'danger',
                msg: 'Invalid type',
                title: 'Error'
            });

            return next();
        }


        if (file) {
            const { id, ext } = file;

            const query = `
                UPDATE Teams
                SET picture = ?
                WHERE number = ?
                    AND eventKey = ?
            `;

            await DB.run(query, [id + '.' + ext, teamNumber, eventKey]);

            res.json({
                status: 'success',
                msg: 'Picture saved',
                title: camelCaseToNormalCasing(type as string)
            });

            serverLog(req, 'Saved picture', {
                type: 'picture',
                info: {
                    id
                }
            });
            req.io.emit("new-picture", { teamNumber, eventKey, id, ext });

        } else {
            res.json({
                status: 'danger',
                msg: 'No file found',
                title: 'Error'
            });
        }
    } catch (e) {
        console.error(e);
        res.json({
            status: 'danger',
            msg: 'Error saving picture',
            title: 'Error'
        });
    }


    next();
});
module.exports = router;