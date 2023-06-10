// PRIORITY_1
// class FIRSTField {
//     /**
//      * An image of the field
//      * @param {Number} year The year you are in
//      */
//     constructor (year) {
//         this.year = year;
//         this.src = `../static/pictures/${year}/field.png`;

//     }
//     /**
//      * Draws the field onto a canvas
//      * @param {Node} canvas The canvas to draw this on (NOT THE CONTEXT!!!)
//      * @param {Function} onImageLoad Runs after the image is displayed on the canvas for layering purposes (Put all of you draw things inside of this function because it loads the image asynchronously which causes layering stuff to be weird)
//      */
//     draw (canvas, onImageLoad) {
//         if (!canvas) throw new Error("No Canvas Found")
//         const ctx = canvas.getContext("2d");
//         const tempImg = new Image()
//         tempImg.src = this.src;
//         tempImg.onload = () => {
//             ctx.drawImage(tempImg, 0, 0, canvas.width, canvas.height);
//             onImageLoad();
//         };
//     }
// }

class db_Trace {
    /**
     * Creating a new instance of the trace class
     * @param {Array} traceData An array of arrays or objects formatted with an x y and time
     */
    constructor (traceData) {
        if (!traceData) throw new Error("No trace data given")
        this.traceData = traceData;

    }

    /**
     * Gets a trace that is simplified down to an db_TracePosition or db_TraceAction
     * @param {Node} canvas A canvas to scale the data to.
     * @returns {Array.<db_TracePosition>} 
     */
    getDisplayableTrace(canvas) {
        return this.traceData.map(line => {
            if (Array.isArray(line)) {
                return line.map(position => {
                    return new db_TracePosition(position[0] * canvas.width, position[1] * canvas.height, position[2]);
                });
            } else {
                return [new db_TraceAction(line.p[0] * canvas.width, line.p[1] * canvas.height, line.p[2], line.action)];
            }
        });
    }

    /**
     * Draws this trace onto a canvas
     * @param {Node} canvas The canvas to draw this on (NOT THE CONTEXT!!!)
     * @param {Number} startTime The trace will be between this time and the end time in case it is very cluttered.
     * @param {Number} endTime The trace will be between the start time and this time in case it is very cluttered.
     */
    draw (canvas, startTime, endTime) {
        const { canvas: _canvas } = canvas;
        const ctx = _canvas.getContext("2d");

        const trace = this.getDisplayableTrace(_canvas);
        trace.forEach((line, lineIndex) => {
            line.forEach((c, i) => {
                if (startTime <= c.time && (c.time <= endTime || endTime == 150)) {
                    let last = line[i - 1];
                    if (!last) {
                        // Grabbing the point from the previous line so that the lines will connect with each other
                        const lastList = this.getLastList(trace, lineIndex - 1);

                        if (!lastList) {
                            return;
                        }

                        last = lastList[lastList.length - 1];

                        if (!last && !c instanceof db_TraceAction) {
                            return;
                        }
                    }
                    
                    // Plots a line between the previous point and this point
                    c.plotLine(_canvas, last);
                }
            });
        });
    }

    getLastList(trace, lineIndex) {
        const lastList = trace[lineIndex];

        if (!lastList) return;

        const [ traceAction ] = lastList;
        if (traceAction && traceAction instanceof db_TraceAction) {
            const { action } = traceAction;
            const { connect } = db_TraceAction.actionColorAndIconMap[action];
            if (!connect) {
                const list = this.getLastList(trace, lineIndex - 1);

                return list;
            };
        }
        
        return lastList;
    } 
}

class db_TracePosition {
    static timeColors = {
        auto: Color.fromBootstrap("success").toString(),
        teleop: Color.fromBootstrap("primary").toString(),
        endgame: Color.fromBootstrap("warning").toString(),
    }

    /**
     * A point that the trace line is drawn between.
     * @param {Number} x An x position along the trace line (scaled to the canvas).
     * @param {Number} y A y position along the trace line (scaled to t he canvas).
     * @param {Number} time At what point in time the robot was at the respective x and y values (for coloring the point).
     */
    constructor(x, y, time) {
        this.x = x;
        this.y = y;
        this.time = time;
    }

    /**
     * Plots a line between this point and the previous point the robot was at.
     * @param {Node} canvas The canvas to plot the line on.
     * @param {db_TracePosition} previousPoint Where the robot was before it came to this point. 
     */
    plotLine(canvas, previousPoint) {
        const ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(previousPoint.x, previousPoint.y);

        // Changing the color of the line based of whether the line is in auto, teleop or endgame
        const { timeColors } = db_TracePosition;
        if (this.time < 15) ctx.strokeStyle = timeColors.auto;
        else if (this.time > 120) ctx.strokeStyle = timeColors.endgame;
        else ctx.strokeStyle = timeColors.teleop;

        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        ctx.closePath();
    }
}

class db_TraceAction extends db_TracePosition {
    // Copied over from the scouting app github repo
    // TODO: change this based off the current year
    static actionColorAndIconMap = {
        // 2022
        "Ball High": { color : "blue", connect: true},
        Missed: { color : "gold", connect: true},
        "Ball Low": { color : "navy", connect: true},
        Foul: { color : "red", connect: true},
        "Bar 1": { color : "blue", src: "../static/pictures/icons/tally-marks-1.png", connect: true},
        "Bar 2": { color : "red", src: "../static/pictures/icons/tally-marks-2.png", connect: true},
        "Bar 3": { color : "green", src: "../static/pictures/icons/tally-marks-3.png", connect: true},
        "Bar 4": { color : "magenta", src: "../static/pictures/icons/tally-marks-4.png", connect: true},

        //2023
        "pickCone": { color : "yellow", src: "../static/pictures/2023/cone.svg", connect: true},
        "pickKnockedCone": { color : "orange", src: "../static/pictures/2023/knockedCone.svg", connect: true},
        "pickCube": { color : "purple", src: "../static/pictures/2023/cube.svg", connect: true},
        "pickLoadingCone": { color: "yellow", src: "../static/pictures/2023/cone.svg", connect: false },
        "pickLoadingCube": { color: "purple", src: "../static/pictures/2023/cube.svg", connect: false },
        "foul": { color : "red", src: "../static/pictures/2023/Foul.svg", connect: true},
        "level": { color : "green", src: "../static/pictures/2023/level.svg", connect: true},
        "notLevel": { color : "green", src: "../static/pictures/2023/notLevel.svg", connect: true},
        "tipped": { color : "rgb(0, 125, 255)", src: "../static/pictures/2023/tipped.svg", connect: true},
        "notTipped": { color : "blue", src: "../static/pictures/2023/notTipped.svg", connect: true},
        "placeCone": { color: "yellow", src: "../static/pictures/2023/cone.svg", connect: false },
        "placeCube": { color: "purple", src: "../static/pictures/2023/cube.svg", connect: false },
        "placeHybrid": { color: "grey", src: "../static/pictures/2023/hybrid.svg", connect: false },
        "bulldoze-cone": { color: "lime", src: "../static/pictures/2023/bulldoze-cone.svg", connect: false },
        "bulldoze-cube": { color: "lime", src: "../static/pictures/2023/bulldoze-cube.svg", connect: false },

    }

    /**
     * A point and icon that the trace line is drawn between.
     * @param {Number} x An x position along the trace line (scaled to the canvas).
     * @param {Number} y A y position along the trace line (scaled to the canvas).
     * @param {Number} time At what point in time the robot was at the respective x and y values (for coloring the point).
     * @param {String} action String that maps to the color of the icon and the icon image
     */
    constructor(x, y, time, action) {
        super(x, y, time);
        this.action = action;

        if (action == "bulldoze") {
            this.action = Math.random() > 0.99 ? "bulldoze-cube" : "bulldoze-cone";
        }
    }

    /**
     * Plots a line between this point and the previous point the robot was at.
     * @param {Node} canvas The canvas to plot the line on.
     * @param {db_TracePosition} previousPoint Where the robot was before it came to this point. 
     */
    plotLine(canvas, previousPoint) {
        const ctx = canvas.getContext("2d");
        // Getting the color and image source for the icon
        // I am not able to use material icons because canvas doesn't have that functionality
        const { color, src, connect } = db_TraceAction.actionColorAndIconMap[this.action] || { color: "#000000"};

        // Plotting a line between the previous point and the position of this point
        if (previousPoint && connect) db_TracePosition.prototype.plotLine(canvas, previousPoint);

        ctx.fillStyle = color;
        ctx.beginPath();

        const radius = this.action == "bulldoze-cube" ? 12 : 8;
        // Creating a circle for the icon
        ctx.arc(this.x, this.y, radius + 1, 0, 2*Math.PI);
        ctx.fill();
        if (src) {
            const tempImg = new Image();
            tempImg.src = src;

            tempImg.onload = () => {
                // Drawing the image after it has loaded
                const size = radius * 2;
                ctx.drawImage(tempImg, this.x - size/2, this.y - size/2, size, size);
            };
        }
    }
}