declare class FIRSTYear {
    static classes: {
        [year: number]: new (year: number) => FIRSTYear;
    };
    /**
     *
     * @param {Number} year number between 2007 and now
     * @returns {FIRSTYear} The FIRSTYear object
     */
    static build(year: number): Promise<FIRSTYear>;
    number: number;
    events: FIRSTEvent[];
    /**
     *
     * @param {Number} year The year of the FIRSTYear
     */
    constructor(year: number);
    /**
     * Events to add to the year
     * @param  {...FIRSTEvent} events first events
     */
    addEvents(...events: FIRSTEvent[]): void;
    /**
     * Gets all the events in the year
     */
    getEvents(): Promise<void>;
}
//# sourceMappingURL=year.d.ts.map