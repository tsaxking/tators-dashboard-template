// PRIORITY_1
class FIRSTYear {
    static classes: {
        [year: number]: new (year: number) => FIRSTYear
    } = {}

    /**
     * 
     * @param {Number} year number between 2007 and now 
     * @returns {FIRSTYear} The FIRSTYear object
     */
    static async build(year: number): Promise<FIRSTYear> {
        const yearObj = new FIRSTYear(year);
        await yearObj.getEvents();
        return yearObj;
    }

    number: number;
    events: FIRSTEvent[];

    /**
     * 
     * @param {Number} year The year of the FIRSTYear 
     */
    constructor(year: number) {
        if (year < 2007 || year > new Date().getFullYear()) throw new Error('Invalid year');
        /**
         * @type {Number} The year of the FIRSTYear
         */
        this.number = year;
        /**
         * @type {Array[FIRSTEvent]} An array of all the events in the year
         */
        this.events = [];
    }

    /**
     * Events to add to the year
     * @param  {...FIRSTEvent} events first events
     */
    addEvents(...events: FIRSTEvent[]) {
        this.events.push(...events);
    }

    /**
     * Gets all the events in the year
     */
    async getEvents() {
        const events: Array<{
            info: TBAEvent
            matches: TBAMatch[],
            properties: FIRSTEventProperties,
            teams: TBATeam[],
        }> = await requestFromServer({
            url: '/events/get-tator-events',
            method: 'POST',
            body: {
                year: this.number
            }
        });
        this.events = [];
        this.addEvents(...events.map(e => {
            return new FIRSTEvent(e.info, e.properties, this);
        }));
    }
}