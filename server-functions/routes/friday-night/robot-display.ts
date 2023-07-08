import { Router } from 'express';
const router = Router();


import { DB } from '../../databases';

// class robotMatch{
//     constructor(teamNumber, eventKey, matchNumber){
//         this.teamNumber = teamNumber;
//         this.eventKey = eventKey;
//         this.matchNumber = matchNumber;
//     }
// }
// class RobotData {
//     constructor(teamNumber, eventKey) {
//         this.teamNumber = teamNumber;
//         this.eventKey = eventKey;
//         this.matches = [];
//     }
//     getAuto() {
//         const autoScores = [];
//         const autoScoresH = [];
//         const autoScoresL = [];
//         matches.forEach(match => {
//             let auto = JSON.parse(match.auto);
//             if (auto.tarmac) { autoScores.push(2) } else { autoScores.push(0) };
//             autoScoresH.push(auto.highBall * 4);
//             autoScoresL.push(auto.lowBall * 2);
//         })
//         return { auto: autoScores, autoH: autoScoresH, autoL: autoScoresL };
//     }
//     getTele() {
//         const teleScoresH = [];
//         const teleScoresL = [];
//         matches.forEach(match => {
//             let tele = JSON.parse(match.teleop);
//             teleScoresH.push(tele.highBall * 2);
//             teleScoresL.push(tele.lowBall);
//         })
//         return { teleH: teleScoresH, teleL: teleScoresL };
//     }

// }

// router.post('/score-info', async(req, res, next) => {
//     const { teamNumber, eventKey } = req.body;

//     const query = `
//         SELECT *
//         FROM MatchScouting
//         WHERE teamNumber = ?
//         AND eventKey = ?
//     `;

//     let matches = await DB.all(query, [teamNumber, eventKey]);
//     // matches.reverse();

//     matches.sort((a, b) => a.matchNumber - b.matchNumber)

//     const matchNumbers = [];
//     const autoScores = [];
//     const autoScoresH = [];
//     const autoScoresL = [];
//     const teleScoresH = [];
//     const teleScoresL = [];
//     const endgameScores = [];
//     matches.forEach(match => {
//         let auto = JSON.parse(match.auto);
//         if (auto.tarmac) { autoScores.push(2) } else { autoScores.push(0) };
//         autoScoresH.push(auto.highBall * 4);
//         autoScoresL.push(auto.lowBall * 2);

//         let tele = JSON.parse(match.teleop);
//         teleScoresH.push(tele.highBall * 2);
//         teleScoresL.push(tele.lowBall)

//         let endgame = JSON.parse(match.endgame);
//         let endgameScore = 0
//         switch (endgame) {
//             case endgame.bar4:
//                 endgameScore = 15;
//                 break;
//             case endgame.bar3:
//                 endgameScore = 10;
//                 break;
//             case endgame.bar2:
//                 endgameScore = 6;
//                 break;
//             case endgame.bar1:
//                 endgameScore = 4;
//                 break;
//             default:
//                 endgameScore = 0;
//         }

//         if (endgame.bar4) {
//             endgameScore = 15;
//         } else if (endgame.bar1) {
//             endgameScore = 4;
//         }
//         endgameScores.push(endgameScore);
//         matchNumbers.push(match.matchNumber);
//     })

//     let matchData = {
//         matchNum: matchNumbers,
//         auto: autoScores,
//         autoH: autoScoresH,
//         autoL: autoScoresL,
//         teleH: teleScoresH,
//         teleL: teleScoresL,
//         endgame: endgameScores,
//     }

//     res.json({
//         autoScores,
//         matchData,
//         matches
//     });

//     next();
// });

// const { getAllEvents, requestFromTBA, getEventInfo } = require('../../tba-request');

// router.post('/get-robot', async(req, res, next) => {
//     const { teamNumber, year } = req.body;

//     res.json(await getAllEvents(year, teamNumber, false));

//     next();
// });

// router.post('/get-picture', async(req, res, next) => {
//     const { teamNumber, eventKey } = req.body;

//     const query = `
//         SELECT picture
//         FROM Teams
//         WHERE number = ?
//             AND eventKey = ?
//             AND active = 1
//     `;

//     try {
//         const { picture } = await DB.get(query, [teamNumber, eventKey]);
//         res.json(picture);
//     } catch {
//         res.json(false);
//     }

//     next();
// });

router.post("/heatmap", async(req, res, next) => {
    try {
        const {
            teamNumber,
            eventKey
        } = req.body;

        const query = `
            SELECT heatmap
            FROM Teams
            WHERE number = ?
                AND eventKey = ?
                AND active = 1
        `;

        const team = await DB.get(query, [teamNumber, eventKey]);

        if (!team) {
            res.json({
                msg: 'Team not found',
                status: 'danger',
                title: 'Error'
            });
            return;
        } 
        const heatmaps = JSON.parse(team.heatmap);
        if (!heatmaps) {
            res.json({
                msg: 'Team not found',
                status: 'danger',
                title: 'Error'
            });
            return;
        }
        res.json(heatmaps);
    } catch (e) {
        console.error(e);
        res.json({
            msg: 'Team not found',
            status: 'danger',
            title: 'Error'
        });
    }

    next();
});
/*
// /**
//  * Gets the array of all of a team's dashboard comments from an event
//  * @param {number} teamNumber The team's number
//  * @param {string} eventKey The key of the event you want to pull data from
//  * @returns 
//  */
// async function getComments(teamNumber, eventKey) {
//     const query = `
//         SELECT dashboardComments
//         FROM Teams
//         WHERE number = ?
//             AND eventKey = ?
//             AND active = 1
//     `;
//     const team = await DB.get(query, [teamNumber, eventKey]);
//     if (!team) return [];
//     const comments = team.dashboardComments;

//     // Checks whether comments is a stringified json
//     if (typeof comments == "string") return JSON.parse(comments);
//     return [];

// }

// /**
//  * Sets the comments on the database for a team to an array of strings
//  * @param {number} teamNumber The team you want to set comments for
//  * @param {string} eventKey The events since the comments are event specific
//  * @param {string[]} comments the new comments value
//  */
// async function setComments (teamNumber, eventKey, comments) {
//     // updating the database to include the new comment
//     const query = `
//         UPDATE Teams
//         SET dashboardComments = ?
//         WHERE number = ?
//             AND eventKey = ?
//     `;

//     await DB.run(query, [JSON.stringify(comments), teamNumber, eventKey]);
// }

// /**
//  * Finds an existing comment and edits it
//  * @param {number} teamNumber The number of the team you want to edit the comment of
//  * @param {string} eventKey The event you want to find data from
//  * @param {string} previousValue The comment prior to edits so we can find it
//  * @param {string} comment The new comment to replace it with
//  */
// async function editComment(teamNumber, eventKey, previousValue, comment) {
//     const existingComments = await getComments (teamNumber, eventKey);

//     // the index of where the comment is within the existing comments
//     const commentIndex = existingComments.indexOf(previousValue);

//     // Editing the comments if it can
//     if (commentIndex < 0) {
//         existingComments[commentIndex] = comment;

//         // updating the database to include the new comment
//         await setComments(teamNumber, eventKey, existingComments);

//     }

//     return existingComments;
// }

// /**
//  * Adds a comment to a team's comment list
//  * @param {number} teamNumber The team to add the comment to
//  * @param {string} eventKey The events since the comments are event specific
//  * @param {string} comment The comment to add
//  */
// async function addComment(teamNumber, eventKey, comment) {
//     const existingComments = await getComments(teamNumber, eventKey);
//     if (comment && typeof comment == "string") {
//         existingComments.push(comment);

//         await setComments(teamNumber, eventKey, existingComments);
//     }
//     return existingComments;
// }

// function setRobotDisplaySocket(io) {
//     io.on("connection", socket => {
//         socket.on("get comments", async ({ teamNumber, eventKey }) => {
//             const comments = await getComments(teamNumber, eventKey);
//             socket.emit('comments', comments);
//         });
        
//         socket.on("edit comment", async ({ teamNumber, eventKey, comment, previousValue }) => {        
//             const comments = await editComment(teamNumber, eventKey, previousValue, comment);
        
//             io.emit('comments', comments);
//         });
        
//         socket.on("add comment", async ({ teamNumber, eventKey, comment }) => {        
//             const comments = await addComment(teamNumber, eventKey, comment);

//             io.emit('comments', comments);
//         });
//     });
// }
/**/

module.exports = { router, setRobotDisplaySocket };