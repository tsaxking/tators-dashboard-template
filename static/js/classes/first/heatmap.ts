type HeatmapPoint = [number, number, number];
type SegmentHeatmap = HeatmapPoint[];
type HeatmapData = {
    auto: SegmentHeatmap,
    teleop: SegmentHeatmap,
    endgame: SegmentHeatmap,
};

class Heatmap {
    /**
     * Combines an array of heatmaps
     * Returns an array of the combined heatmaps
     * @param {Array<Array<HeatmapPoint>>} heatmaps An array of heatmaps
     * @returns {Array<HeatmapPoint>} 
     */
    static combineHeatmaps(heatmaps: SegmentHeatmap[]): SegmentHeatmap{
        const heatmap: SegmentHeatmap = [];
        // Adds each of the points from each heatmap to one heatmap array
        heatmaps.forEach(h => {
            h.forEach((p) => {
                // let x: number, y: number, v: number;

                const [x, y, v]: [number, number, number] = p;
                
                // Checks whether a position already exists because if it does it will just increase the value of that position
                const index = heatmap.findIndex((e) => {
                    const [x2, y2] = e;
                    return x2 === x && y2 === y;
                });

                if (index === -1) {
                    // adds the position to the heatmap
                    heatmap.push([x, y, v]);
                } else {
                    const point = heatmap[index];
                    // increases the value for the existing position
                    point[2] += v;
                }
            });
        });

        return heatmap;
    }

    /**
     * Finds the color of a square on the heatmap based off the amount of times a robot has been in that squares, the max amount of times a robot has been in any square and the average of the values for all squares
     * @param {number} value the amount of times a robot has been in that squares
     * @param {number} max the max amount of times a robot has been in any of the square
     * @param {number} average the average of the values for all squares
     * @returns {String} a color in the form of "rgba(r, g, b, a)"
     */
    static findColor(value: number, max: number, average: number): string {
        const normalAverage = average / max
        const ratio = value / max;
        let r: number, g: number, b: number;
        let scale = ratio * (max / average) ** .6;

        if (ratio < normalAverage) {
            r = 0;
            g = scale;
            b = 1 - g;
        } else if (ratio > normalAverage) {
            b = 0;
            r = scale;
            g = 1 - r;
        } else {
            r = 0;
            g = 1;
            b = 0;
        }
        return `rgba(${r*255}, ${g*255}, ${b*255}, ${(scale ** .5) * .75})`;
    }

    // Was clearing field view and didn't actually need to clear the heatmap
    // /**
    //  * Clears a canvas 
    //  * @param {Node} canvas the canvas to clear stuff from
    //  */
    // static clearCanvas(canvas) {
    //     // canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    // }

    /**
     * Fetches data of where a team has been during a certain event 
     * Returns an object with properties like auto, teleop, and endgame that store data for that specific time section
     * @param {number} teamNumber The number of the team you want the data for
     * @param {string} eventKey The event you want the data for
     * @returns {Object}
     */
    static async fetchHeatmapDataFromServer(teamNumber: number, eventKey: string = currentEvent.info.key): Promise<HeatmapData> {
        const body = { teamNumber, eventKey };
        const data = ServerRequest.new('/robot-display/heatmap', body, /*{
            cached: true,
        }*/);

        return data;
    }

    data: HeatmapData;

    /**
     * Creates a heatmap that is able to draw itself onto a canvas
     * @param {HeatmapData} data An object with properties like auto, teleop, and endgame that store data about where the robot was located during that time section
     */
    constructor(data: HeatmapData) {
        this.data = data;
    }

    /**
     * Draws the heatmap onto a canvas
     * @param {Node} canvas The canvas to draw the heatmap onto
     * @param {Array.<String>} heatmapsNames The name of the segments of the match you want the heatmap to display
     * @example
     * const heatmap = new Heatmap({"auto": [...], "endgame": [...]});
     * 
     * // if you want to only show data for auto you can put 
     * heatmap.draw(canvas, ["auto"]);
     * 
     * // but if you want to show data for both segments you can put
     * heatmap.draw(canvas, ["auto", "endgame"]);
     * 
     * // also if you want to show every segment you can do
     * heatmap.draw(canvas, ["all"]);
     */
    draw({ canvas, context }: Canvas, heatmapsNames: Array<keyof HeatmapData | "all">) : void {
        const heatmaps: SegmentHeatmap[] = [];
        // Combining the different heatmaps based of which ones should be shown
        if (heatmapsNames.includes("all")) heatmaps.push(...Object.values(this.data));
        else heatmapsNames.forEach((name) => {
            if (name === "all") return;
            if (this.data[name]) heatmaps.push(this.data[name]);
        });
        const combinedHeatmaps = Heatmap.combineHeatmaps(heatmaps);

        const { width, height } = canvas;

        //Getting canvas context
        // Getting the width and height of each square that will be drawn
        const squareWidth = 1 / 100 * width;
        const squareHeight = 1 / 50 * height;
        // Getting the highest value in the trace array
        const values = combinedHeatmaps.map(e => e[2]);
        const max = Math.max(... values);
        const { length } = combinedHeatmaps;
        const total = values.reduce((a, b) => a + b, 0) 
        const average = total / length;
        // Clearing Canvas
        // Heatmap.clearCanvas(canvas);

        combinedHeatmaps.forEach(p => {
            const [px, py, v] = p;
            // Setting the color of each heatmap pixel to how many times the robot has been in each place compared to the rest of the graph
            const visible = v / average * combinedHeatmaps.length > .05;
            context.fillStyle = visible ? Heatmap.findColor(v, max, average) : `rgba(0,0,0,0)`;
            // Getting the x and y positions for this pixel
            let x = px * squareWidth;
            let y = py * squareHeight;
            // Drawing the pixel
            context.fillRect(x, y, squareWidth, squareHeight);
        });
    }
}
