/**
 * Class that represents a set of paths on the whiteboard
 */
class WhiteboardRobot {
    /**
     * 
     * @param {String} position Red1, Red2, Red3, Blue1, Blue2, Blue3 
     * @param {String} color custom color for the robot 
     */
    constructor(position, color) {
        this.position = position;
        this.color = color;

        this.robotInfo = {};

        this.paths = new PathCollection();

        this.startPosition = {
            x: null,
            y: null,
            angle: null
        }
    }

    /**
     * Moves the initial position of the robot
     * @param {Number} x 
     * @param {Number} y 
     */
    moveTo(x, y) {
        this.startPosition.x = x;
        this.startPosition.y = y;
    }

    /**
     *  Draws the robot and paths on the canvas
     * @param {Canvas} canvas custom canvas class 
     */
    draw({ context }) {
        if (this.startPosition.x && this.startPosition.y) {
            context.save();
            context.translate(this.startPosition.x, this.startPosition.y);
            context.rotate(this.startPosition.angle);
            context.drawImage(
                this.robotImage, -robotWidth / 2, -robotHeight / 2,
                robotWidth,
                robotHeight
            );
            context.restore();
        }
    }

    /**
     * Rotates the initial robot position to a specific angle
     * @param {Number} angle in radians 
     */
    rotateTo(angle) {
        this.startPosition.angle = angle;
    }

    /**
     * Sets the custom robot info to be the FIRSTTeam object representing the team
     * @param {Number} teamNumber team number 
     */
    setTeam(teamNumber) {
        this.robotInfo = currentEvent.teamsObj[teamNumber];
    }
}