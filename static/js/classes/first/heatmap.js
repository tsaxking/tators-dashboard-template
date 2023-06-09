class Heatmap {
    /**
     * Combines an array of heatmaps
     * @param {Array[Array]} heatmaps An array of heatmaps
     * @returns {Array.<Object>} An array of the combined heatmaps
     */
    static combineHeatmaps(heatmaps) {
        const heatmap = [];
        // Adds each of the points from each heatmap to one heatmap array
        heatmaps.forEach(h => {
            h.forEach((p) => {
                let [x, y, v] = [undefined, undefined, undefined];

                // Gets an individual position from the heatmap
                // you have to check whether its array because different heatmaps have gotten formatted differently
                if (Array.isArray(p)) {
                    [x, y, v] = p;
                } else {
                    const { x: x2, y: y2, value: v2 } = p;
                    [x, y, v] = [x2, y2, v2];
                }

                // Checks whether a position already exists because if it does it will just increase the value of that position
                const index = heatmap.findIndex((e) => e[0] === x && e[1] === y);

                if (index === -1) {
                    // adds the position to the heatmap
                    heatmap.push([x, y, v]);
                } else {
                    // increases the value for the existing position
                    heatmap[index][2] += v;
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
    static findColor(value, max, average) {
        const ratio = value / max;
        let r, g, b;
        let scale = ratio * (max / average) ** .6;

        if (ratio < average / max) {
            r = 0;
            // g = ratio * max / average;
            g = scale;
            b = 1 - g;
        } else if (ratio > average / max) {
            // g = (ratio - average / max) * max / average;
            b = 0;
            r = scale;
            g = 1 - r;
        } else {
            r = 0;
            g = 1;
            b = 0;
        }
        return `rgba(${r*255},${g*255},${b*255},${(scale ** .5) * .75})`;
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
    static async fetchHeatmapDataFromServer(teamNumber, eventKey = currentEvent.info.key) {
        const data = await requestFromServer({
            url: '/robot-display/heatmap',
            method: 'POST',
            body: {
                teamNumber,
                eventKey
            },
            cached: true
        });

        return data;
    }

    /**
     * Creates a heatmap that is able to draw itself onto a canvas
     * @param {Object} data An object with properties like auto, teleop, and endgame that store data about where the robot was located during that time section
     */
    constructor(data) {
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
    draw({ canvas }, heatmapsNames) {
        const heatmaps = [];
        // Combining the different heatmaps based of which ones should be shown
        if (heatmapsNames.includes("all")) heatmaps.push(...Object.values(this.data));
        else heatmapsNames.forEach(name => {
            if (this.data[name]) heatmaps.push(this.data[name]);
        });
        const combinedHeatmaps = Heatmap.combineHeatmaps(heatmaps);

        //Getting canvas context
        const ctx = canvas.getContext('2d');
        // Getting the width and height of each square that will be drawn
        const squareWidth = 1 / 100 * canvas.width;
        const squareHeight = 1 / 50 * canvas.height;
        // Getting the highest value in the trace array
        const max = Math.max(...combinedHeatmaps.map(e => e[2]));
        const average = (combinedHeatmaps.reduce((a, b) => a + b[2], 0) / combinedHeatmaps.length);

        // const total = heatmap.reduce((c, v) => c + v.value, 0);
        // const average = total / heatmap.length;
        // Clearing Canvas
        // Heatmap.clearCanvas(canvas);

        combinedHeatmaps.forEach(p => {
            // Setting the color of each heatmap pixel to how many times the robot has been in each place compared to the rest of the graph
            ctx.fillStyle = p[2] / average * combinedHeatmaps.length > .05 ? Heatmap.findColor(p[2], max, average) : `rgba(0,0,0,0)`;
            // Getting the x and y positions for this pixel
            let x = p[0] / 100 * canvas.width;
            let y = p[1] / 50 * canvas.height;
            // Drawing the pixel
            ctx.fillRect(x, y, squareWidth, squareHeight);
        });
    }
}