class Month {
    /**
     * @param {Date} date date object
     */
    constructor(date) {
        this.date = date;

        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const day = new Date(date);
        day.setDate(1);
        this.days = new Array(daysInMonth).fill(0).map((_, i) => {
            const date = new Date(day);
            date.setDate(date.getDate() + i);
            return new Day(date);
        });
    }

    next() {
        const date = new Date(this.date);
        date.setMonth(date.getMonth() + 1);
        return new Month(date);
    }

    prev() {
        const date = new Date(this.date);
        date.setMonth(date.getMonth() - 1);
        return new Month(date);
    }

    get start() {
        return this.days[0].date;
    }

    get end() {
        return this.days[this.days.length - 1].date;
    }

    get weeks() {
        const weeks = [];
        let week = new Week(this.start);
        while (week.start < this.end) {
            weeks.push(week);
            week = week.next();
        }
        return weeks;
    }
}