interface Page {
    onOpen(query?: string): void;
    onInit(): void;
    onEventChange(): void;
    onYearChange(): void;
    group: string;
    name: string;
    page: Node;
    eventKey?: string;
    year?: number;
    open: boolean;
    initialized: boolean;
}
declare class Dashboard {
}
//# sourceMappingURL=pages.d.ts.map