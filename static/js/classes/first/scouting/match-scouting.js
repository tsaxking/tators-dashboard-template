// PRIORITY_1
class MatchScouting {

    static decompressTrace(trace) {
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
    static decompress (str) {
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
    static parse (str) {
        return [+str.slice(0, 2)/100, +str.slice(2, 4)/100, +str.slice(4, 10)/1000];
    }

    static decompressAndParse (str) {
        return this.parse(this.decompress(str))
    }

    constructor(matchScoutingObj, match) {
        const { compLevel, preScoutingKey } = matchScoutingObj;
        if (!(match instanceof FIRSTMatch || (match === undefined && (compLevel == "pr" || preScoutingKey)))) throw new Error('Invalid match, received: ' + (match ? match.constructor.name : typeof match));
        this.match = match;
        Object.assign(this, matchScoutingObj);

        // Parse JSON strings
        [
            "trace",
            "auto",
            "teleop",
            "endgame",
            "overall",
            "end",
        ].forEach(key => this[key] = this[key] ? JSON.parse(this[key]) : null);

        this.trace = MatchScouting.decompressTrace(this.trace);
    }
}

class MatchScoutingCollection {
    /**
     * 
     * @param  {...MatchScouting} matchScoutings MatchScouting objects to add to the collection
     */
    constructor(...matchScoutings) {
        this.matches = matchScoutings;
    }

    get averageContribution() {
        return this.matches.reduce((sum, match) => sum + match.pointContribution, 0) / this.matches.length;
    }

    get maxContribution() {
        return Math.max(...this.matches.map(match => match.pointContribution));
    }

    get minContribution() {
        return Math.min(...this.matches.map(match => match.pointContribution));
    }

    /**
     * @returns {MatchScouting[]} Unique matches in the collection
     */
    get unique() {
        return this.matches.filter((match, index, self) => {
            return index === self.findIndex(m => m.matchNumber === match.matchNumber && m.compLevel === match.compLevel);
        });
    }

    /**
     * 
     * @param {MatchScouting} matchScouting MatchScouting object to add to the collection
     */
    add(matchScouting) {
        this.matches.push(matchScouting);
    }

    /**
     * @param {MatchScouting} matchScouting MatchScouting object to remove from the collection
     * @returns {Boolean} Whether or not the object was removed
     */
    remove(matchScouting) {
        const { length } = this.matches;
        this.matches = this.matches.filter(m => m !== matchScouting);
        return length !== this.matches.length;
    }
}