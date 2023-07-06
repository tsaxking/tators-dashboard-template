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

type FIRSTMatchConstructor = new (tbaMatch: object, event: FIRSTEvent, teams: Array<FIRSTTeam>) => FIRSTMatch;

class FIRSTMatch {
    static classes: {
        [year: number]: FIRSTMatchConstructor
    } = {}

    key: any;
    /**
     * Builds a FIRSTMatch object from the TBA API
     * @param {FIRSTEvent} event FIRSTEvent object of the event the match is in
     * @param {Object} tbaMatch The TBA match object
     */
    static async build(event: FIRSTEvent, tbaMatch: object) {
        if (!(event instanceof FIRSTEvent)) throw new Error('Event must be a FIRSTEvent object!');

        const camelCaseTBAMatch: TBAMatch = convertToCamelCase(tbaMatch);
        const { alliances } = camelCaseTBAMatch;

        // gets team from FIRSTEvent.teamsObj
        const getTeam = (teamKey: string) => event.teamsObj[+teamKey.replace('frc', '')];

        if (!alliances) return;

        const { red, blue } = alliances;

        // put teams in order
        const teams = [ red, blue ].map(a => {
            return a.teamKeys.map(getTeam);
        }).flat();

        const definedTeams = teams.filter(t => t);

        const { classes } = FIRSTMatch;
        const { year }=  event.info;
        const Constructor = classes[year] || FIRSTMatch;

        const match = new Constructor(camelCaseTBAMatch, event, definedTeams);

        return match;
    }

    event: FIRSTEvent;
    info: TBAMatch;
    teams: FIRSTTeam[];
    winningAlliance?: string;
    alliances?: TBAAlliances;
    matchNumber: number;
    compLevel: string;

    /**
     * 
     * @param {Object} tbaMatch The TBA match object
     * @param {FIRSTEvent} event FIRSTEvent object of the event the match is in
     * @param {Array[FIRSTTeam]} teams An array of FIRSTTeams in the match
     */
    constructor(tbaMatch: object = {}, event: FIRSTEvent, teams: Array<FIRSTTeam> = []) {
        if (!(event instanceof FIRSTEvent)) throw new Error('Event must be a FIRSTEvent object! Received: ' + event);

        // if (teams.length < 6) throw new Error('Match must be built with 6 teams! Received: ' + teams.length);
        // else {
        //     teams.forEach((t, i) => {
        //         if (!(t instanceof FIRSTTeam)) throw new Error('Invalid type at index ' + i + ' in teams array');
        //     });
        // }

        /**
         * @type {FIRSTEvent} The FIRSTEvent object of the event the match is in
         */
        this.event = event;

        /**
         * @type {Object} The info object from TBA
         */
        this.info = convertToCamelCase(tbaMatch);

        const {
            alliances,
            matchNumber,
            compLevel
        } = this.info;

        this.alliances = alliances;
        this.matchNumber = matchNumber;
        this.compLevel = compLevel;

        // Converts matchNumber into a string
        // this.matchNumber += [];

        /**
         * @type {Array[FIRSTTeam]} An array of FIRSTTeams in the match
         */
        this.teams = teams;

        /**
         * @type {Array[FIRSTAlliance]} An array of FIRSTAlliance objects [red, blue]
         */
        // this.alliances = FIRSTAlliance.fromMatch(this);
    }

    /**
     * @type {Object} An object of FIRSTTeam objects with the team number as the key
     */
    get teamsMatchScoutingObj() {
        return this.teamsMatchScouting.reduce((obj: {
            [n: number]: MatchScouting
        }, match) => {
            const { teamNumber } = match;
            obj[teamNumber] = match;
            return obj;
        }, {});
    }

    /**
     * @type {Array[FIRSTTeamMatchScouting]} An array of FIRSTTeamMatchScouting objects
     */
    get teamsMatchScouting(): MatchScouting[] {
        return this.teams.map(t => {
            const { matches } = t.matchScouting;
            return matches.find(m => {
                const { matchNumber, compLevel } = m;
                return matchNumber == this.matchNumber &&
                    compLevel == this.compLevel;
            });
        }).filter((m: undefined | MatchScouting): m is MatchScouting => !!m).sort((a, b) => a.matchNumber - b.matchNumber);
    }

    /**
     * 
     * @param {Number} number The team number 
     */
    hasTeam(number: number) {
        if (isNaN(number)) throw new Error('Number must be a number! Received: ' + number);
        return this.teams.some(t => t.number == number);
    }

    /**
     * Gets which alliance a team is on
     * @param {number} number The number of the team
     * @returns {string}
     */
    alliance(number: number): string | boolean {
        const numberStr = number + "";
        if (!this.alliances) return false;
        let red = this.alliances.red.teamKeys.map(t => t.slice(3)).includes(numberStr) ? 'red' : false;
        let blue = this.alliances.blue.teamKeys.map(t => t.slice(3)).includes(numberStr) ? 'blue' : false;

        return red || blue;
    }
    /**
     * @returns {Object} An object of the teams in the match (keyed by alliance color)
     */
    get teamObj() {
        const { alliances } = this;
        if (!alliances) return;
        return (['red', 'blue'] as (keyof TBAAlliances)[]).reduce((obj: {
            [allianceAndNumber: string]: FIRSTTeam | undefined
        }, alliance) => {
            alliances[alliance].teamKeys.forEach((teamKey, i) => {
                obj[alliance + '-' + (i + 1)] = this.teams.find(t => t.number == +teamKey.replace('frc', ''));
            });
            return obj;
        }, {})
    }

    /**
     * returns the alliance the team is on
     */
    get winner(): string  {
        if (this.winningAlliance == 'red') {
            return 'red';
        } else if (this.winningAlliance == 'blue') {
            return 'blue';
        } else {
            return 'tie';
        }
    }
}