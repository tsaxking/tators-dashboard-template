class FIRSTEvent {
    /**
     * 
     * @param {Object} tbaInfo Thebluealliance event object 
     * @param {Object} eventProperties Properties 
     * @param {FIRSTYear} year 
     */
    constructor(tbaInfo = {}, eventProperties, year) {
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
        this.properties = eventProperties ? eventProperties : {};
        
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
        return this.matches.reduce((acc, m) => {
            acc[m.key] = m;
            return acc;
        }, {});
    }

    get teamsObj() {
        return this.teams.reduce((acc, t) => {
            acc[t.number] = t;
            return acc;
        }, {});
    }

    /**
     * Builds the event from the TBA event keys
     */
    async build() {
        if (this.built) return;

        this.field.render();
        // this.getScoutingData()

        // TODO: combine get-event-info and get-event-scouting into an array then Promise.all()
        let {
            matches,
            teams
        } = await requestFromServer({
            url: '/events/get-event-info',
            method: 'POST',
            body: {
                eventKey: this.info.key
            }
        });

        // const eventScouting = await requestFromServer({
        //     url: '/events/get-event-scouting',
        //     method: 'POST',
        //     body: {
        //         eventKey: this.info.key
        //     }
        // });

        const scoutingArr = ['preScouting', 'pitScouting', 'electricalScouting', 'mechanicalScouting', 'eliminationMatchScouting'];

        const [
            eventScouting,
            ...scoutingQuestions
        ] = await multiRequest({
            url: '/events/get-event-scouting',
            method: 'POST',
            body: {
                eventKey: this.info.key
            }
        }, ...scoutingArr.map(s => ({
            url: '/questions/get-questions',
            method: 'POST',
            body: {
                eventKey: this.info.key,
                type: s
            }
        })));

        scoutingArr.forEach((s, i) => {
            this[s + 'Questions'] = scoutingQuestions[i];
        });

        // teams built first so that matches can be built with the teams
        this.addTeams(...(await Promise.all(teams.map(t => {
            const tatorInfo = eventScouting.teams.find(es => es.number === t.team_number);

            return FIRSTTeam.build(this, t, tatorInfo);
        }))));

        this.addMatches(...(await Promise.all(matches.map(m => {
            return FIRSTMatch.build(this, m);
        }))));

        // matches are filtered inside this function
        this.teams.forEach(t => t.addMatches(...this.matches));

        eventScouting.matches.forEach(sm => {
            if (this.properties.hidePr && sm.compLevel == "pr") return;
            const match = this.matches.find(m => {                
                const { compLevel, matchNumber } = m.info;

                // This is just a check for the edge case where a match gets redone because a field element broke or something like that
                // There are usually only 1-2 of these per event but it is still useful to have that extra data
                const redone = sm.compLevel == "re" && compLevel == "qm";
                return +sm.matchNumber === +matchNumber &&                    
                    (sm.compLevel === compLevel || redone);
            });

            const team = this.teamsObj[sm.teamNumber];
    
            if (match && team) team.addMatchScouting(sm);
            else if (team && (sm.compLevel === 'pr' || sm.preScoutingKey)) team.addMatchScouting(sm);
            else console.warn('Match scouting not paired with a match', sm);
        });

        const matchScoutingObjects = this.teams.map(t => {
            return t.matchScouting.matches;
        }).flat();

        // running this code after all of the matchScoutings have turned into MatchScouting objects
        matchScoutingObjects.forEach(sm => {

            // Getting the match scouting objects for the other teams on this teams alliance
            // This lets you calculate partial link
            const otherMatchScoutings = matchScoutingObjects.filter(m => {
                const { compLevel, matchNumber, alliance } = m;
                return compLevel == sm.compLevel &&
                    matchNumber == sm.matchNumber &&
                    alliance == sm.alliance
            });

            sm.otherTeams = otherMatchScoutings;

        });

        this.built = true;

        return this;
    }

    /**
     *  Adds teams to the event
     * @param  {...FIRSTTeam} teams Teams to add to the event
     */
    addTeams(...teams) {
        teams.forEach((t, i) => {
            if (!(t instanceof FIRSTTeam)) {
                throw new Error('Invalid type at index ' + i + ' of parameters');
            }
        });

        this.teams.push(...teams);

        // Sorting all of the teams by their numbers because they were sorted alphabetically before
        this.teams.sort((t1, t2) => t1.number - t2.number);
    }

    /**
     * Adds matches to the event
     * @param  {...FIRSTMatch} matches Matches to add to the event
     */
    addMatches(...matches) {
        matches.forEach((m, i) => {
            if (!(m instanceof FIRSTMatch)) {
                throw new Error('Invalid type at index ' + i + ' of parameters');
            }
        });

        this.matches.push(...matches);

        // Sorting all of the matches by their numbers because they were sorted alphabetically before
        // this.matches.sort((m1, m2) => m1.matchNumber - m2.matchNumber);

        matches.forEach(m => {
            this.matchesObj[m.key] = m;
        });

        this.matches.sort((a, b) => {
            const order = ['pr', 'qm', 'ef', 'qf', 'sf', 'f'];
            const aIndex = order.indexOf(a.info.compLevel);
            const bIndex = order.indexOf(b.info.compLevel);

            if (aIndex === bIndex) {
                return a.info.matchNumber - b.info.matchNumber;
            } else {
                return aIndex - bIndex;
            }
        });
    }

    /**
     * Gets all the scouting data for the event
     */
    // async getScoutingData() {
    //     const { key: eventKey } = this.info;

    //     try {
    //         // using a fetch request because writable streams are weird and I'm unsure how they interact with requestFromServer

    //         const scoutedMatchesStream = await fetch('/events/get-all-match-scouting', {
    //             method: "POST",
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 eventKey,
    //             }),
    //         });
    //         // const scoutedMatches = await requestFromServer({
    //         //     url: '/events/get-all-match-scouting',
    //         //     method: 'POST',
    //         //     body: {
    //         //         eventKey
    //         //     }
    //         // });
    
    //         const decoder = new TextDecoder("utf-8")

    //         let buffer = "";

    //         const populateMatch = m => {
    //             console.log(m);
    //             try {
    //                 const sm = JSON.parse(m);

    //                 const match = this.matches.find(m => {
    //                     return +sm.matchNumber === +m.info.matchNumber &&
    //                         sm.compLevel === m.info.compLevel;
    //                 });
    //                 const team = this.teamsObj[sm.teamNumber];
        
    //                 if (match && team) team.addMatchScouting(sm);
    //                 else {
    //                     if (team && sm.compLevel === 'pr') team.addMatchScouting(sm);
    //                     else console.warn('Match scouting not paired with a match', sm);
    //                 }
    //             } catch (e) {
    //                 if (!buffer) buffer += m;
    //                 else {
    //                     const combinedBuffer = buffer + m;
    //                     buffer = "";
    //                     populateMatch(combinedBuffer);
    //                 }
    //             }

    //         }

    //         const writeSteam = new WritableStream({
    //             write: encoded => {
    //                 const decoded = decoder.decode(encoded, { stream: true });
    //                 const matches = decoded.split("\"\"");

    //                 matches.forEach(populateMatch);
    //             }
    //         }) 

    //         scoutedMatchesStream.body.pipeTo(writeSteam);
    //     } catch (e) {
    //         console.error(e);
    //     }
    // } 

    // TODO: simplify this
    async addMatchScouting(matchScouting) {
        const { teamNumber, matchNumber } = matchScouting;

        Object.entries(matchScouting).forEach(([k, v]) => {
            try {
                if (k.includes("Info")) k = k.slice(0, k.length - 4);
                matchScouting[k] = v;
            } catch (e) {}
        });

        // matchScouting.trace = MatchScouting.decompressTrace(matchScouting.trace);

        const team = this.teams.find(t => t.number == teamNumber);
        const { matchScouting: existingMatchScouting } = team;
        const match = this.matches.find(m => m.compLevel == "qm" && m.matchNumber == matchNumber);

        const matchScoutingClass = MatchScouting[this.info.year] || MatchScouting
        const matchScoutingObject = new matchScoutingClass(matchScouting, match);
        existingMatchScouting.matches = existingMatchScouting.matches.filter(m => m.matchNumber != matchNumber);

        team && existingMatchScouting.matches.push(matchScoutingObject);
        // this is now a getter
        // if (match && team) match.teamsMatchScouting.matches[team] = matchScoutingObject;

        const heatmapInfo = await Heatmap.fetchHeatmapDataFromServer(teamNumber, this.key);
        team.tatorInfo.heatmap = new Heatmap(heatmapInfo);
    }

    get highestScore () {
        if (this.teams.length == 0) return 70;
        return Math.max(...this.teams.map(team => {
            return team.matchScouting.maxContribution;
        }));
    }






    get newTeamSelect() {
        const select = new CustomBootstrap.Select(document.createElement('select'));

        select.addOption('Select a team', '', true, null);

        this.teams.forEach(t => {
            select.addOption(t.number + ' | ' + t.info.nickname, t.number, false, t);
        });

        return select;
    }


    get newMatchSelect() {
        const select = new CustomBootstrap.Select(document.createElement('select'));

        select.addOption('Select a match', '', true, null);

        this.matches.forEach(m => {
            select.addOption(m.compLevel + ' - ' + m.matchNumber, m.compLevel + '-' + m.matchNumber, false, m);
        });

        return select;
    }
}