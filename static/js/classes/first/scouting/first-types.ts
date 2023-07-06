type Point = [
    x: number,
    y: number,
    t: number
];

// Takes in <T> because the action could be a string 
// when you are using compressed points or it could 
// be a point when you are using decompressed points
type Action<T> = {
    action: string
    p: T
}

type CompressedTrace = (string[] | Action<string>)[];
type DecompressedTrace = (Point[] | Action<Point>)[];