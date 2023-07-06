type TBATeam = {
    team_number: number;
    heatmap: string
}

class FIRSTTeam {
    /**
     * Builds a FIRSTTeam object from a FIRSTEvent and a tba Team object
     * @param {FIRSTEvent} event Event the team was in 
     * @param {Object} tbaInfo tba Team object 
     * @returns {FIRSTTeam} The team
     */
    static async build(event: FIRSTEvent, tbaInfo: { heatmap?: string }, tatorInfo: DBTatorInfo): Promise<FIRSTTeam> {
        if (!(event instanceof FIRSTEvent)) throw new Error('Invalid event type');
        if (!tbaInfo) throw new Error('Invalid tbaInfo');
        const t = new FIRSTTeam(event, tbaInfo, new TatorInfo(tatorInfo));
        // t.tatorInfo = new TatorInfo(tatorInfo);
        return t;
    }

    tatorInfo: TatorInfo;
    event: FIRSTEvent;
    info: {
        teamNumber: number,
        nickname: string,
    };
    number: number;
    matches: FIRSTMatch[];
    matchScouting: MatchScoutingCollection;
    heatmap: null;

    /**
     * 
     * @param {FIRSTEvent} event 
     * @param {Object} tbaInfo tba Team object
     */
    constructor(event: FIRSTEvent, tbaInfo: object, tatorInfo: TatorInfo) {
        if (!(event instanceof FIRSTEvent)) throw new Error('Invalid event type');
        /**
         * @type {FIRSTEvent} The event the team was in
         */
        this.event = event;

        /**
         * @type {Object} TBA info for the team
         */
        this.info = convertToCamelCase(tbaInfo);

        /**
         * @type {Number} The team number
         */
        this.number = this.info.teamNumber;

        /**
         * @type {Object} Event-specific info for the team
         * @property {PitScouting} pitScouting The team's nickname
         * @property {Array[PreScouting]} preScouting An array of all the pre scouting data for the team 
         */
        this.tatorInfo = tatorInfo;

        /**
         * @type {Array[FIRSTMatch]} An array of all the matches the team was in
         */
        this.matches = [];

        const YearCollectionClass = MatchScoutingCollection.classes[event.info.year];
        const CollectionClass = YearCollectionClass || MatchScoutingCollection;
        /**
         * @type {MatchScoutingCollection} A collection of all the match scouting data for the team
         */
        this.matchScouting = new CollectionClass();

        /**
         * @type {FIRSTEvent} The event the team was in
         */
        this.event = event;

        /**
         * @type {Heatmap} The heatmap for the team
         */
        this.heatmap = null;
    }

    /**
     * @returns {Object} Object of all the matches in the team (keyed by their tba match key)
     */
    get matchesObj(): {
        [matchKey: string]: FIRSTMatch
    } {
        return this.matches.reduce((obj: {
            [matchKey: string]: FIRSTMatch
        } , match) => {
            obj[match.key] = match;
            return obj;
        }, {});
    }

    /**
     * Adds matches to the team
     * @param  {...FIRSTMatch} matches 
     */
    addMatches(...matches: FIRSTMatch[]) {
        // matches.forEach((m, i) => {
        //     if (!(m instanceof FIRSTMatch)) throw new Error('Invalid match type in index ' + i + ' of matches array. Received: ' + (m ? m.constructor.name : typeof m));
        // });

        matches.forEach(m => {
            if (m.hasTeam(this.number)) {
                this.matches.push(m);
                this.matchesObj[m.key] = m;
            }
        });

        this.matches.sort((a, b) => {
            const order = ['qm', 'ef', 'qf', 'sf', 'f'];
            if (a.compLevel == b.compLevel) return a.matchNumber - b.matchNumber;
            else return order.indexOf(a.compLevel) - order.indexOf(b.compLevel);
        });
    }

    /**
     * Adds match scouting data to the team
     * @param  {...MatchScouting} scoutings scoutings to add 
     */
    addMatchScouting(...scoutings: DBMatchScouting[]) {
        const { classes } = MatchScouting;
        const { year } = this.event.info;
        const MSConstructor = classes[year];
        if (!MSConstructor) throw new Error('Invalid year for match scouting: ' + this.event.info.year);

        // scoutings.forEach((s, i) => {
        //     if (!(s instanceof DBMatchScouting)) throw new Error('Invalid scouting type in index ' + i + ' of scoutings array');
        // });

        scoutings.forEach(s => {
            const match = this.matches.find(m => {
                const { compLevel, matchNumber } = m;

                // This is just a check for the edge case where a match gets redone because a field element broke or something like that
                // There are usually only 1-2 of these per event but it is still useful to have that extra data
                const redone = s.compLevel == "re" && compLevel == "qm";
                return +s.matchNumber === +matchNumber &&                    
                    (s.compLevel === compLevel || redone);
            });

            try {
                if ((s.compLevel == "pr" || s.preScoutingKey) || (match && match.hasTeam(this.number))) {
                    const scouting = new MSConstructor(s, match);
                    this.matchScouting.add(scouting);
                    if (match) match.teamsMatchScoutingObj[this.number] = scouting;
                }
            } catch (e) {
                console.error(e);
            }
        });
    }

    get frameDimensions (): string {
        const { tatorInfo } = this;
        if (!tatorInfo) return "No Data";
        const { pitScouting } = tatorInfo;
        if (!pitScouting) return "No Data";
        const { data } = pitScouting;
        if (!data) return "No Data";
        const { Dimensions, Width, Length } = data as {
            Dimensions: string,
            Width: number,
            Length: number,
        };
        const widthAndLength = Width && Length;

        if (!(Dimensions || widthAndLength)) return "No Data";
        return widthAndLength ? `${Width}x${Length}` : Dimensions;
    }

    get dimensionNumbers (): string[] {
        const { frameDimensions } = this;

        const numbers = frameDimensions.split(/[^0-9.]/).filter(e => e && e != "_");
        
        return numbers;
    }
}