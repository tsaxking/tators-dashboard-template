class Week {
    /**
     * @param {Date} date date object
     */
    constructor(date) {
        this.date = date;
        this.month = new Month(date);

        const day = new Date(date);
        day.setDate(day.getDate() - day.getDay());
        this.days = new Array(7).fill(0).map((_, i) => {
            const date = new Date(day);
            date.setDate(date.getDate() + i);
            return new Day(date);
        });
    }

    next() {
        const date = new Date(this.date);
        date.setDate(date.getDate() + 7);
        return new Week(date);
    }

    prev() {
        const date = new Date(this.date);
        date.setDate(date.getDate() - 7);
        return new Week(date);
    }

    get start() {
        return this.days[0].date;
    }

    get end() {
        return this.days[6].date;
    }
}