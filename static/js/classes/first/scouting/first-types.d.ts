type Point = [
    x: number,
    y: number,
    t: number
];
type Action<T> = {
    action: string;
    p: T;
};
type CompressedTrace = (string[] | Action<string>)[];
type DecompressedTrace = (Point[] | Action<Point>)[];
//# sourceMappingURL=first-types.d.ts.map