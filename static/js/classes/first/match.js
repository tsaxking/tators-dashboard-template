// PRIORITY_2

class FIRSTMatch {
    /**
     * Builds a FIRSTMatch object from the TBA API
     * @param {FIRSTEvent} event FIRSTEvent object of the event the match is in
     * @param {Object} tbaMatch The TBA match object
     */
    static async build(event, tbaMatch) {
        if (!(event instanceof FIRSTEvent)) throw new Error('Event must be a FIRSTEvent object!');

        tbaMatch = convertToCamelCase(tbaMatch);

        // gets team from FIRSTEvent.teamsObj
        const getTeam = (teamKey) => event.teamsObj[teamKey.replace('frc', '')];

        // put teams in order
        let teams = [
            ...tbaMatch.alliances.red.teamKeys.map(getTeam),
            ...tbaMatch.alliances.blue.teamKeys.map(getTeam)
        ];

        teams = teams.filter(t => t);

        const C = FIRSTMatch[event.info.year] ? FIRSTMatch[event.info.year] : FIRSTMatch;

        const match = new C(tbaMatch, event, teams);

        return match;
    }

    /**
     * 
     * @param {Object} tbaMatch The TBA match object
     * @param {FIRSTEvent} event FIRSTEvent object of the event the match is in
     * @param {Array[FIRSTTeam]} teams An array of FIRSTTeams in the match
     */
    constructor(tbaMatch = {}, event, teams = []) {
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
        Object.assign(this, this.info);

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
        return this.teamsMatchScouting.reduce((obj, m) => {
            obj[m.teamNumber] = m;
            return obj;
        }, {});
    }

    /**
     * @type {Array[FIRSTTeamMatchScouting]} An array of FIRSTTeamMatchScouting objects
     */
    get teamsMatchScouting() {
        return this.teams.map(t => {
            return t.matchScouting.matches.find(m => {
                return m.matchNumber == this.matchNumber &&
                    m.compLevel == this.compLevel;
            });
        }).filter(m => m).sort((a,b) => a.matchNumber - b.matchNumber);
    }

    /**
     * 
     * @param {Number} number The team number 
     */
    hasTeam(number) {
        if (isNaN(number)) throw new Error('Number must be a number! Received: ' + number);
        return this.teams.some(t => t.number == number);
    }

    /**
     * Gets which alliance a team is on
     * @param {number} number The number of the team
     * @returns {string}
     */
    alliance(number) {
        number = number + "";
        let red = this.alliances.red.teamKeys.map(t => t.slice(3)).includes(number) ? 'red' : false;
        let blue = this.alliances.blue.teamKeys.map(t => t.slice(3)).includes(number) ? 'blue' : false;

        return red || blue;
    }
    /**
     * @returns {Object} An object of the teams in the match (keyed by alliance color)
     */
    get teamObj() {
        return ['red', 'blue'].reduce((obj, alliance) => {
            this.info.alliances[alliance].teamKeys.forEach((teamKey, i) => {
                obj[alliance + '-' + (i + 1)] = this.teams.find(t => t.number == teamKey.replace('frc', ''));
            });
            return obj;
        }, {})
    }

    /**
     * returns the alliance the team is on
     */
    get winner() {
        if (this.winningAlliance == 'red') {
            return 'red';
        } else if (this.winningAlliance == 'blue') {
            return 'blue';
        } else {
            return 'tie';
        }
    }
}