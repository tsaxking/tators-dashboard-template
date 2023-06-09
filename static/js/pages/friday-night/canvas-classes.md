# Field 
Creates an image of the field that can be displayed on various canvases.

## constructor(year: Number)
- year - The year you are in

## draw(canvas: Node, onImageLoad: Function)
- Draws the field onto a canvas
- canvas - The canvas to draw this on (NOT THE CONTEXT!!!)
- onImageLoad - Runs after the image is displayed on the canvas for layering purposes (Put all of you draw things inside of this function because it loads the image asynchronously which causes layering stuff to be weird)


# Heatmap (got moved to global-classes.js)

## constructor (data: Object)
* Creates a heatmap that is able to draw itself onto a canvas
* data - An object with properties like auto, teleop, and endgame that store data about where the robot was located during that time section

## static combineHeatmaps(heatmaps: Array of an Array of Object): Array of Object
* Combines an array of heatmaps
* heatmaps - An array of heatmaps
* returns an array of the combined heatmaps

## static findColor(value: Number, max: Number, average: Number): String
* Finds the color of a square on the heatmap based off the amount of times a robot has been in that squares, the max amount of times a robot has been in any square and the average of the values for all squares
* value - the amount of times a robot has been in that squares
* max - the max amount of times a robot has been in any of the square
* average - the average of the values for all squares
* returns a color in the form of "rgba(r, g, b, a)"

## static async fetchHeatmapDataFromServer(teamNumber: number, eventKey: string): Object
* Fetches data of where a team has been during a certain event 
* Returns an object with properties like auto, teleop, and endgame that store data for that specific time section
* teamNumber - The number of the team you want the data for
* eventKey - The event you want the data for

## draw (canvas: Node, heatmapsNames: Array of Strings)
* Draws the heatmap onto a canvas
* canvas - The canvas to draw the heatmap onto
* heatmapsNames - The name of the segments of the match you want the heatmap to display
* 
```javascript
const heatmap = new Heatmap({"auto": [...], "endgame": [...]});
 
// if you want to only show data for auto you can put 
heatmap.draw(canvas, ["auto"]);
 
// but if you want to show data for both segments you can put
heatmap.draw(canvas, ["auto", "endgame"]);
```

# Trace
Displays a robots path throughout a match onto a canvas.

## constructor
- Parameter of type: Array, traceData An array of arrays or objects formatted with an x y and time

## getDisplayableTrace(canvas: Node)
- Gets a trace that is simplified down to an rd_TracePosition or rd_TraceAction
- canvas - A canvas to scale the data to.
- returns an Array filled with rd_TracePosition, 

## draw(canvas: Node, startTime: number, endTime: number)
- Draws this trace onto a canvas
- canvas - The canvas to draw this on (NOT THE CONTEXT!!!)
- startTime - The trace will be between this time and the end time in case it is very cluttered.
- endTime - The trace will be between the start time and this time in case it is very cluttered.


# rd_TracePosition
A point that the trace line is drawn between.

## constructor(x: Number, y: Number, time: Number)
- x - An x position along the trace line (scaled to the canvas).
- y - A y position along the trace line (scaled to the canvas).
- time - At what point in time the robot was at the respective x and y values (for coloring the point).

## plotLine(canvas: Node, previousPointL rd_TracePosition)
- Plots a line between this point and the previous point the robot was at.
- canvas - The canvas to plot the line on.
- previousPoint - Where the robot was before it came to this point. 

# rd_TraceAction
A point and icon that the trace line is drawn between.

## constructor (x: Number, y: Number, time: Number, action: String)
-  x - An x position along the trace line (scaled to the canvas).
-  y - A y position along the trace line (scaled to the canvas).
-  time - At what point in time the robot was at the respective x and y values (for coloring the point).
-  action - String that maps to the color of the icon and the icon image

## plotLine(canvas: Node, previousPoint: rd_TracePosition)
- Plots a line between this point and the previous point the robot was at.
- canvas - The canvas to plot the line on.
- previousPoint - Where the robot was before it came to this point. 
