type DBMatchScouting = {
    trace: string,
    compLevel: string,
    matchNumber: number,
    preScoutingKey: string
    teamNumber: number;
    pointContribution: number,
    alliance: string,
    otherTeams: MatchScouting[],
    auto?: string
    teleop?: string
    endgame?: string
    overall?: string,
    scout: string,
}

type TimeSegment = {
    grid: string,
    ["Total Distance (Ft)"]: number,
    ["Velocity (ft/s)"]: number,
}

enum MatchScoutingParseCheckKeys {
    trace = "trace",
    auto = "auto",
    teleop = "teleop",
    endgame = "endgame",
    overall = "overall",
}

type FIRSTMatchScoutingConstructor = new (matchScoutingObj: DBMatchScouting, match?: FIRSTMatch) => MatchScouting;

// PRIORITY_1
class MatchScouting {
    static classes: {
        [year: number]: FIRSTMatchScoutingConstructor,
    } = {};

    static decompressTrace(trace: CompressedTrace): DecompressedTrace {
        return trace.map(line => {
            if (Array.isArray(line)) {
                return line.map(point => {
                    return typeof point == 'string' ? this.decompressAndParse(point) : point;
                });
            } else {
                const { p, action } = line;
                return { 
                    action,
                    p: typeof p == "string" ? this.decompressAndParse(p) : p,
                };
            }
        });
    }

    static chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:"<>?`~[]\';./=\\,';

    /**
     * 
     * @param {String} str 
     * @returns {String}
     */
    static decompress(str: string): string {
        // const num = (+parseInt(str, 36)).toString();
        // return new Array(10 - num.length).fill('0').join('') + num;

        // use chars
        const base = this.chars.length;
        let num = 0;
        for (let i = 0; i < str.length; i++) {
            num += this.chars.indexOf(str[i]) * Math.pow(base, str.length - i - 1);
        }
        str = num.toString();

        return new Array(10 - str.length).fill('0').join('') + str;
    }

    /**
     * 
     * @param {String} str 
     * @returns {Array}
     */
    static parse (str: string): Point {
        return [+str.slice(0, 2)/100, +str.slice(2, 4)/100, +str.slice(4, 10)/1000];
    }

    static decompressAndParse (str: string): Point {
        return this.parse(this.decompress(str))
    }

    match?: FIRSTMatch;
    trace?: DecompressedTrace;
    pointContribution: number;
    matchNumber: number;
    compLevel: string;
    teamNumber: number;
    preScoutingKey?: string;
    alliance: string;
    otherTeams: MatchScouting[];
    auto?: TimeSegment & { autoMobility: boolean };
    teleop?: TimeSegment;
    endgame?: TimeSegment & { parked: boolean };
    overall?: TimeSegment & {
        comments: string,
        defensiveComments: string,
        easilyDefendable: boolean,
        problemsDriving: boolean,
        robotDied: boolean,
        robotTippy: boolean,
    };
    scoutName: string;

    constructor(matchScoutingObj: DBMatchScouting, match?: FIRSTMatch) {
        const { compLevel, preScoutingKey } = matchScoutingObj;
        const doesntNeedTBA = (compLevel == "pr" || preScoutingKey);
        const validMatch = !(match instanceof FIRSTMatch || (match === undefined && doesntNeedTBA));
        if (validMatch) throw new Error('Invalid match, received: ' + match);
        
        this.match = match;
        const { 
            pointContribution,
            matchNumber,
            teamNumber,
            alliance,
            otherTeams,
            scout
        } = matchScoutingObj;

        this.pointContribution = pointContribution;
        this.matchNumber = matchNumber;
        this.teamNumber = teamNumber;
        this.alliance = alliance;
        this.otherTeams = otherTeams;
        this.compLevel = compLevel;
        this.scoutName = scout;

        const parseNeeding: MatchScoutingParseCheckKeys[] = [
            MatchScoutingParseCheckKeys.trace,
            MatchScoutingParseCheckKeys.auto,
            MatchScoutingParseCheckKeys.teleop,
            MatchScoutingParseCheckKeys.endgame,
            MatchScoutingParseCheckKeys.overall,
        ];

        // Parse JSON strings
        parseNeeding.forEach((key: MatchScoutingParseCheckKeys) => {
            const value = matchScoutingObj[key];
            if (value) {
                const parsed = JSON.parse(value);
                this[key] = key == "trace" ? MatchScouting.decompressTrace(parsed) : parsed;
            }
        });

    }
}

type FIRSTMatchScoutingCollectionConstructor = new (...matchScoutings: MatchScouting[]) => MatchScoutingCollection;

class MatchScoutingCollection {
    static classes: {
        [year: number]: FIRSTMatchScoutingCollectionConstructor,
    } = {};
    matches: MatchScouting[];
    /**
     * 
     * @param  {...MatchScouting} matchScoutings MatchScouting objects to add to the collection
     */
    constructor(...matchScoutings: MatchScouting[]) {
        this.matches = matchScoutings;
    }

    get pointContributions() {
        return this.matches.map(match => match.pointContribution);;
    }

    // This will actually return NaN if there are 
    // no matches instead of undefined so it only returns numbers
    get averageContribution() : number {
        const totalContribution = this.pointContributions.reduce((a, b) => a + b);
        return totalContribution / this.matches.length;
    }

    get maxContribution() : number | undefined {
        const { pointContributions } = this;
        return Math.max(...pointContributions);
    }

    get minContribution() : number | undefined {
        const { pointContributions } = this;
        return Math.min(...pointContributions);
    }

    /**
     * @returns {MatchScouting[]} Unique matches in the collection
     */
    get unique(): MatchScouting[] {
        return this.matches.filter((match, index, updatedArray) => {
            const i = updatedArray.findIndex(m => 
                m.matchNumber === match.matchNumber && 
                m.compLevel === match.compLevel
            );
            return index === i;
        });
    }

    /**
     * 
     * @param {MatchScouting} matchScouting MatchScouting object to add to the collection
     */
    add(matchScouting: MatchScouting): void {
        this.matches.push(matchScouting);
    }

    /**
     * Removes a matchScouting from this collection
     * Returns whether or not the object was removed
     * @param {MatchScouting} matchScouting MatchScouting object to remove from the collection
     * @returns {Boolean} 
     */
    remove(matchScouting: MatchScouting): boolean {
        const { length } = this.matches;
        this.matches = this.matches.filter(m => m !== matchScouting);
        return length !== this.matches.length;
    }
}