import e from 'express';
import { Router } from 'express';
import { DB } from '../databases';
// import { roles, permissions } from '../middleware/permissions';
import TBA, { requestFromTBA } from '../structure/tba-request';
const { getEventInfo, getAllEvents } = TBA;

// import { Heatmap, HeatmapCollection } from '../calculations/trace';

const router = Router();

type DBMatchScouting = {
    trace: string,
    compLevel: string,
    matchNumber: number,
    preScoutingKey: string
    teamNumber: number;
    pointContribution: number,
    alliance: string,
    // otherTeams: MatchScouting[],
    auto?: string
    teleop?: string
    endgame?: string
    overall?: string,
    scout: string,
}

type DBTatorInfo = {
    active: number,
    dashboardComments: null | string,
    electricalScouting: null | string,
    eliminationMatchScouting: null | string,
    eventKey: string,
    heatmap: null | string,
    heatmap2: null | string,
    mechanicalScouting: null | string,
    number: number,
    picture: null | string,
    pitScouting: null| string,
    preScouting: null | string,
}

type TBATeam = {
    team_number: number;
    heatmap: string
    media: object[],
    key: string,

}

// PRIORITY_2
type TBAAlliance = {
    teamKeys: string[]
}

type TBAAlliances = {
    red: TBAAlliance,
    blue: TBAAlliance
}

type TBAMatch = {
    alliances?: TBAAlliances,
    compLevel: string,
    matchNumber: number,
};

type TBAEvent = {

}


router.post('/get-event-info', async(req, res, next) => {
    const { eventKey } = req.body;

    const eventInfo = await getEventInfo(eventKey) as {
        matches: TBAMatch[],
        teams: TBATeam[],
        info: TBAEvent
    };

    const year = eventKey.slice(0, 4);
    const { teams } = eventInfo;
    await Promise.all(teams.map(async team => {
        team.media = await requestFromTBA(`/team/${team.key}/media/${year}`);
    }));

    res.json(eventInfo);

    next();
});

router.post("/get-event-scouting", async(req, res, next) => {
    const { eventKey } = req.body;

    const query = `
        SELECT *
        FROM MatchScouting
        WHERE eventKey = ?
    `;

    const query2 = `
        SELECT *
        FROM Teams
        WHERE eventKey = ?
        AND active = 1
    `;

    const [matches, teams] = await Promise.all([query, query2].map(async q => {
        return await DB.all(q, [eventKey]);
    })) as [DBMatchScouting[], DBTatorInfo[]];

    // teams.map(async (team) => {
    //     const teamMatches = matches.filter(m => {
    //         return m.teamNumber == team.number;
    //     });

    //     const heatmapCollection = HeatmapCollection.fromMatchScoutingArray(teamMatches);
    //     const { clientFormat } = heatmapCollection;
    //     team.heatmap2 = JSON.stringify(clientFormat);
    // });

    matches.forEach(match => {
        const { overall } = match;
        if (!overall) return;

        // // Overall is already stringified so we can just clean the entire thing
        // match.overall = textCensor.censor(overall);

        // Checking for emojis
        match.overall = overall.replace(/\p{Extended_Pictographic}/ug, "[emoji blocked]");
    });

    const preScoutingQuery = `
        SELECT preScouting
        FROM Teams
        WHERE number = ?
            AND eventKey LIKE ?
            AND active = 1
    `;

    const year = eventKey.slice(0, 4);
    await Promise.all(teams.map(async team => {
        const results = await DB.all(preScoutingQuery, [team.number, `%${year}%`]) as { preScouting: string }[];
        const combinedResults = results.map(result => {
            const parsed = JSON.parse(result ? result.preScouting : "[]");
            return parsed;
        }).flat();

        team.preScouting = JSON.stringify(combinedResults);
    }));

    res.json({
        matches,
        teams
    });
});

router.post('/get-tator-events', async(req, res, next) => {
    // const { customSession } = req;

    const { year } = req.body;

    let events = await getAllEvents(year, 2122);

    res.json(await Promise.all(events.map(async e => {    
        const query = `
            SELECT eventProperties
            FROM Events
            WHERE eventKey = ?
        `;

        const properties = await DB.get(query, [e]);

        return {
            ...(await getEventInfo(e)),
            properties: properties && properties.eventProperties ? JSON.parse(properties.eventProperties) : {}
        };
    })));

    next();
});