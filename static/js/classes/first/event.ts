type FIRSTEventProperties = {
    field?: string[],
    hidePr?: boolean;
}

enum ScoutingType {
    pitScouting = "pitScouting",
    preScouting = "preScouting",
    electricalScouting = "electricalScouting",
    eliminationMatchScouting = "eliminationMatchScouting",
    mechanicalScouting = "mechanicalScouting",
}

enum QuestionTypes {
    pitScouting = "pitScoutingQuestions",
    preScouting = "preScoutingQuestions",
    electricalScouting = "electricalScoutingQuestions",
    eliminationMatchScouting = "eliminationMatchScoutingQuestions",
    mechanicalScouting = "mechanicalScoutingQuestions",
}

type TBAEvent = {

}

class FIRSTEvent {
    info: { year: number, key: string };
    teams: FIRSTTeam[];
    matches: FIRSTMatch[];
    properties: FIRSTEventProperties;
    field: FIRSTField;
    year: FIRSTYear;
    built?: boolean;
    preScoutingQuestions: any;
    pitScoutingQuestions: any;
    electricalScoutingQuestions: any;
    mechanicalScoutingQuestions: any;
    eliminationMatchScoutingQuestions: any;
    /**
     * 
     * @param {Object} tbaInfo The blue alliance event object 
     * @param {Object} eventProperties Properties 
     * @param {FIRSTYear} year 
     */
    constructor(tbaInfo: TBAEvent, eventProperties: FIRSTEventProperties, year: FIRSTYear) {
        if (!(year instanceof FIRSTYear)) throw new Error('Invalid year type');

        /**
         * @type {Object} The info object from TBA
         */
        this.info = convertToCamelCase(tbaInfo);

        /**
         * @type {Array[FIRSTTeam]} An array of all the teams in the event
         */
        this.teams = [];

        /**
         * @type {Array[FIRSTMatch]} An array of all the matches in the event
         */
        this.matches = [];

        /**
         * @type {Object} Properties of the event
         */
        this.properties = eventProperties || {};
        
        /**
         * @type {FIRSTField} The field of the event
         */
        this.field = new FIRSTField(year.number);
        this.field.setProperties(this.properties.field);

        /**
         * @type {FIRSTYear} The year of the event
         */
        this.year = year;
    }

    get matchesObj() {
        return this.matches.reduce((acc: {
            [matchKey: string]: FIRSTMatch
        }, match) => {
            const { key } = match;
            acc[key] = match;
            return acc;
        }, {});
    }

    get teamsObj() {
        return this.teams.reduce((acc: {
            [teamNumber: number]: FIRSTTeam
        }, team) => {
            const { number } = team;
            acc[number] = team;
            return acc;
        }, {});
    }

    /**
     * Builds the event from the TBA event keys
     */
    async build(): Promise<FIRSTEvent | undefined> {
        if (this.built) return;

        this.field.render();
        // this.getScoutingData()

        const scoutingArr: ScoutingType[] = [
            ScoutingType.preScouting, 
            ScoutingType.pitScouting, 
            ScoutingType.electricalScouting, 
            ScoutingType.mechanicalScouting, 
            ScoutingType.eliminationMatchScouting,
        ];

        const { key } = this.info;

        const scouting = await ServerRequest.multiple(new ServerRequest('/events/get-event-scouting', {
                eventKey: key
            }), new ServerRequest('/events/get-event-info', {
                eventKey: this.info.key
            }), 
            ...scoutingArr.map(scoutingType => new ServerRequest('/questions/get-questions', {
                eventKey: key,
                type: scoutingType
            }))
        );

        const [ eventScouting, eventInfo, ...scoutingQuestions] = scouting as [
            { matches: DBMatchScouting[], teams: DBTatorInfo[], },
            { matches: TBAMatch[], teams: TBATeam[], },
            ...string[]
        ];

        let { matches, teams } = eventInfo;

        scoutingArr.forEach((scoutingType: ScoutingType, i) => {
            const questionType = QuestionTypes[scoutingType];
            const questions = scoutingQuestions[i]
            this[questionType] = questions;
        });

        const teamsPromises = teams.map(t => {
            const tatorInfo = eventScouting.teams.find(es => es.number === t.team_number);
            if (!tatorInfo) return;
            return FIRSTTeam.build(this, t, tatorInfo);
        });
        const teamsMaybe = await Promise.all(teamsPromises);
        
        function removeUndefined<T> (a: Array<T | undefined>) {
            return a.filter(e => e) as unknown as T[]
        }

        // teams built first so that matches can be built with the teams
        this.addTeams(...removeUndefined<FIRSTTeam>(teamsMaybe));

        const matchPromises = matches.map(m => {
            return FIRSTMatch.build(this, m);
        });

        const matchesMaybe = await Promise.all(matchPromises);

        this.addMatches(...removeUndefined<FIRSTMatch>(matchesMaybe));

        // matches are filtered inside this function
        this.teams.forEach(t => t.addMatches(...this.matches));

        eventScouting.matches.forEach(matchScouting => {
            const {
                compLevel: msCompLevel,
                matchNumber: msMatchNumber,
                preScoutingKey,
                teamNumber
            } = matchScouting;

            const isPracticeMatch = msCompLevel == "pr"
            if (this.properties.hidePr && isPracticeMatch) return;
            const match = this.matches.find(matchObject => {                
                const { compLevel, matchNumber } = matchObject.info;

                // This is just a check for the edge case where a match gets redone because a field element broke or something like that
                // There are usually only 1-2 of these per event but it is still useful to have that extra data
                const redone = msCompLevel == "re" && compLevel == "qm";
                const numValid = +msMatchNumber === +matchNumber;
                const compLevelValid = (msCompLevel === compLevel || redone);
                return numValid && compLevelValid;                    
            });

            const team = this.teamsObj[teamNumber];
            const matchOrExcuse = match || isPracticeMatch || preScoutingKey;

            if (team && matchOrExcuse) team.addMatchScouting(matchScouting);
            else console.warn('Match scouting not paired with a match', matchScouting);
        });

        const matchScoutingObjects = this.teams.map(t => {
            const { matches } = t.matchScouting; 
            return matches;
        }).flat();

        // running this code after all of the matchScoutings have turned into MatchScouting objects
        matchScoutingObjects.forEach(matchScouting => {
            const {
                compLevel: msCompLevel,
                matchNumber: msMatchNumber,
                alliance: msAlliance,
            } = matchScouting;

            // Getting the match scouting objects for the other teams on this teams alliance
            // This lets you calculate partial link
            const otherMatchScoutings = matchScoutingObjects.filter(m => {
                const { compLevel, matchNumber, alliance } = m;
                const cValid = compLevel == msCompLevel;
                const nValid = matchNumber == msMatchNumber;
                const aValid = alliance == msAlliance;
                return cValid && nValid && aValid;
            });

            matchScouting.otherTeams = otherMatchScoutings;
        });

        this.built = true;

        return this;
    }

    /**
     *  Adds teams to the event
     * @param  {...FIRSTTeam} teams Teams to add to the event
     */
    addTeams(...teams: FIRSTTeam[]): void {
        teams.forEach((team, i) => {
            if (!(team instanceof FIRSTTeam)) throw new Error('Invalid type at index ' + i + ' of parameters');
        });

        this.teams.push(...teams);

        // Sorting all of the teams by their numbers because they were sorted alphabetically before
        this.teams.sort((t1, t2) => t1.number - t2.number);
    }

    /**
     * Adds matches to the event
     * @param  {...FIRSTMatch} matches Matches to add to the event
     */
    addMatches(...matches: FIRSTMatch[]): void {
        matches.forEach((match, i) => {
            if (!(match instanceof FIRSTMatch)) throw new Error('Invalid type at index ' + i + ' of parameters');
        });

        this.matches.push(...matches);

        // Sorting all of the matches by their numbers because they were sorted alphabetically before
        // this.matches.sort((m1, m2) => m1.matchNumber - m2.matchNumber);

        matches.forEach(m => {
            this.matchesObj[m.key] = m;
        });

        this.matches.sort((a, b) => {
            const order = ['pr', 'qm', 'ef', 'qf', 'sf', 'f'];
            const {
                compLevel: aCompLevel,
                matchNumber: aMatchNumber,
            } = a.info;

            const {
                compLevel: bCompLevel,
                matchNumber: bMatchNumber,
            } = b.info;

            const aIndex = order.indexOf(aCompLevel);
            const bIndex = order.indexOf(bCompLevel);

            // This code does the same thing as this:
            // if (aIndex === bIndex) {
            //     return aMatchNumber - bMatchNumber;
            // } else {
            //     return aIndex - bIndex;
            // }

            // Since aIndex - bIndex is 0 when aIndex === bIndex (number coercion isn't an issue because index always returns a number according to ts)
            // This means that if aIndex != bIndex then aIndex - bIndex will != 0 so the or gate will complete and return aIndex - bIndex
            // However if aIndex == bIndex, then aIndex - bIndex will == 0 so the or gate will check if aMatchNumber - bMatchNumber == 0
            return (aIndex - bIndex) || (aMatchNumber - bMatchNumber);
        });
    }

    // TODO: simplify this
    async addMatchScouting(matchScouting: DBMatchScouting): Promise<undefined> {
        const { teamNumber, matchNumber } = matchScouting;

        type MatchScoutingValue = string | number | MatchScouting[][]
        const entries = Object.entries(matchScouting) as [keyof DBMatchScouting, MatchScoutingValue][];

        entries.forEach(([k, v]) => {
            try {
                const { length } = k;
                if (k.includes("Info")) k = k.slice(0, length - 4) as keyof DBMatchScouting;
                (matchScouting[k] as MatchScoutingValue) = v;
            } catch (e) {}
        });

        const team = this.teams.find(t => t.number == teamNumber);
        if (!team) {
            console.error("Team not found when adding match: ", matchScouting);
            return;
        };

        const { matchScouting: existingMatchScoutings } = team;
        const { matches } = existingMatchScoutings;
        const match = this.matches.find(m => m.compLevel == "qm" && m.matchNumber == matchNumber);

        const matchScoutingClass = MatchScouting.classes[this.info.year] || MatchScouting
        const matchScoutingObject = new matchScoutingClass(matchScouting, match);
        existingMatchScoutings.matches = matches.filter(m => m.matchNumber != matchNumber);

        matches.push(matchScoutingObject);
        // this is now a getter
        // if (match && team) match.teamsMatchScouting.matches[team] = matchScoutingObject;

        const heatmapInfo = await Heatmap.fetchHeatmapDataFromServer(teamNumber, this.info.key);
        team.tatorInfo.heatmap = new Heatmap(heatmapInfo);
    }

    get highestScore (): number {
        if (!this.teams.length) return 70;
        const points = this.teams.map(team => {
            const { pointContributions } = team.matchScouting;
            return pointContributions;
        }).flat();
        if (!points.length) return 70;
        return Math.max(...points);
    }






    get newTeamSelect() {
        const select = new CustomBootstrap.Select(document.createElement('select'));

        select.addOption('Select a team', '', true, null);

        this.teams.forEach(team => {
            const { number, info } = team;
            const name = number + ' | ' + info.nickname;
            select.addOption(name, number, false, team);
        });

        return select;
    }


    get newMatchSelect() {
        const select = new CustomBootstrap.Select(document.createElement('select'));

        select.addOption('Select a match', '', true, null);

        this.matches.forEach(match => {
            const { compLevel, matchNumber } = match;
            const key = compLevel + ' - ' + matchNumber
            select.addOption(key, key, false, match);
        });

        return select;
    }
}