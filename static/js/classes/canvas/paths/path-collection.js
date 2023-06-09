class PathCollection {
    constructor(paths) {
        this.paths = paths || [];
        this.paths.reverse();

        this.latestPath = null;
    }

    /**
     * Adds a path to the collection
     * @param {Path | Undefined} path (optional) Path to add to the collection 
     */
    addPath(path = new Path()) {
        this.paths.unshift(path);
        this.latestPath = path;
    }

    /**
     * 
     * @param {Canvas} canvas 
     */
    draw(canvas) {
        this.paths.forEach(path => path.draw(canvas));
    }
}