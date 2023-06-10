interface Page {
    onOpen(query?: string): void;
    onInit(): void; // open first time
    onEventChange(): void;
    onYearChange(): void;

    group: string;
    name: string;
    page: Node; // not including footer
    eventKey?: string;
    year?: number; // getter?
    open: boolean;
    initialized: boolean;
}


class Dashboard {

}