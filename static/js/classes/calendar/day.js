class Day {
    /**
     * 
     * @param {Date} date date object
     */
    constructor(date) {
        this.date = date;
        this.month = new Month(date);
        this.week = new Week(date);
    }

    next() {
        const date = new Date(this.date);
        date.setDate(date.getDate() + 1);
        return new Day(date);
    }

    prev() {
        const date = new Date(this.date);
        date.setDate(date.getDate() - 1);
        return new Day(date);
    }
}