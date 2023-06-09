class Whiteboard {
    constructor(canvas) {
        /**
         * @type {Canvas} Custom canvas object
         */
        this.canvas = new Canvas(canvas, {
            state: {
                onChange: ({ image }) => {
                    console.log(image);

                    this.canvas.clear();
                    image.draw(this.canvas);
                    // console.log('change', this.canvas.stack.currentIndex);
                },
                onClear: () => {
                    this.canvas.draw();
                },
                onReject: () => {
                    CustomBootstrap.confirm('<span class="no-select">There are no more actions :(</span>');
                }
            },
            clickLog: true
        });

        // this.canvas.canvas.addEventListener('click', (e) => {
        //     let { x, y } = getXY(e);
        //     // console.log(x, y);

        //     const {
        //         width,
        //         height,
        //         top,
        //         left
        //     } = this.canvas.canvas.getBoundingClientRect();

        //     x = (x - left) / width;
        //     y = (y - top) / height;

        //     console.log(x, y);
        // });

        const blackRobot = new WhiteboardRobot('black', 'black');

        /**
         * @type {WhiteboardRobot} Current robot
         */
        this.currentRobot = blackRobot;

        /**
         * @type {WhiteboardRobot} Black robot
         */
        this.blackRobot = blackRobot;

        /**
         * @type {boolean} If the user is drawing
         */
        this.drawing = false;

        /**
         * @type {CanvasButton[]} Array of the buttons representing the driver stations
         */
        this.buttons = wb_driverStationLocations[currentEvent.info.year]
            .map((btn) => {
                const { robot } = btn;
                // delete btn.robot;

                btn = JSON.parse(JSON.stringify(btn));

                const { properties } = currentEvent.field;

                const { x, y } = properties.reduce((acc, prop) => {
                    if (prop.includes('mirror')) {
                        const [_, axis] = prop.split('-');
                        console.log('Mirror', axis, 'axis');
                        acc[axis] = 1 - acc[axis];
                        acc[axis] -= axis === 'x' ? btn.width : btn.height;
                    } else if (prop.includes('rotate')) {
                        console.log('Rotate 180 degrees');
                        acc.x *= -1;
                        acc.y *= -1;
                    }
                    return acc;
                }, {
                    x: btn.x,
                    y: btn.y
                });

                btn.x = x;
                btn.y = y;

                return new CanvasButton({
                    onclick: (e, button) => {
                        console.log('click');
                        // changes robot
                        this.currentRobot = button.customParameters.robot;
                        const { x, y } = this.canvas.getXY(e);
                        this.currentRobot.__initPosition = new Point(x, y);

                        this.gamePiece = null;
                    },
                    onstart: (e, button) => {
                        // console.log('start');
                        // init position and changes robot
                        this.drawing = true;
                        this.currentRobot = button.customParameters.robot;
                        const { x, y } = this.canvas.getXY(e);
                        this.currentRobot.__initPosition = new Point(x, y);
                        // this.currentRobot.moveTo(...getXY(e));
                        // this.currentRobot.rotateTo(0);
                    },
                    onmove: (e, button) => {
                        // console.log('move');
                        const { x, y } = this.canvas.getXY(e);
                        // moving to init position
                        if (this.drawing) {
                            // this.currentRobot.moveTo();
                        }
                    },
                    onend: (e, button) => {
                        // console.log('end');
                        this.drawing = false;

                        if (this.currentRobot.__initPosition) {}
                        const { x, y } = this.canvas.getXY(e);
                        const distance = this.currentRobot.__initPosition.distanceFrom(new Point(x, y));
                        // console.log(x, y, distance);
                        if (distance > 0.01) {
                            console.log('Changed robot');
                            this.currentRobot = button.customParameters.robot;
                        }
                    }
                }, btn, {
                    robot
                });
            });

        // this is the 'blank' state of the whiteboard. No more elements will be added to this.
        this.canvas.add(
            ...this.buttons
        );

        this.resize();

        // for path drawing
        this.canvas.canvas.addEventListener('mousedown', this.startMove.bind(this));
        this.canvas.canvas.addEventListener('mouseup', this.endMove.bind(this));
        this.canvas.canvas.addEventListener('mousemove', this.moving.bind(this));

        this.canvas.canvas.addEventListener('touchstart', this.startMove.bind(this));
        this.canvas.canvas.addEventListener('touchend', this.endMove.bind(this));
        this.canvas.canvas.addEventListener('touchmove', this.moving.bind(this));

        this.penThickness = +currentPage.querySelector('#wb--pen-width').value;

        /**
         * @type {Path}
         */
        this.latestPath = null;

        /**
         * @type {Array[Path]}
         */
        this.paths = [];
        this.canvas.draw();
        this.canvas.addState(); // adds the blank state

        /**
         * @type {CustomIcon} The game piece
         */
        this.gamePiece = null;
    }

    /**
     * Adds a path to the current robot, and starts the path drawing
     * @param {Event} e event
     */
    startMove(e) {
        if (this.currentRobot) {
            // console.log('start');
            this.drawing = true;
            this.canvas.context.lineWidth = this.penThickness;
            const path = new Path(this.currentRobot.color, {
                thickness: this.penThickness
            });

            this.currentRobot.paths.addPath(path);

            this.latestPath = path;
            this.paths.push(path);

            const { x, y } = this.canvas.getXY(e);
            this.canvas.context.beginPath();
            this.canvas.context.strokeStyle = this.currentRobot.color;
            this.canvas.context.moveTo(x * this.canvas.canvas.width, y * this.canvas.canvas.height);
            this.latestPath.addPoint(x, y);
            // this.canvas.start();
        } else if (this.gamePiece) {
            this.canvas.add(this.gamePiece);
            this.canvas.start();
        }
    }

    /**
     * Ends the path drawing and adds a state to the canvas
     * @param {Event} e 
     */
    endMove(e) {
        e.preventDefault();
        // console.log('end');
        this.drawing = false;
        // this.canvas.context.lineWidth = 5;
        this.canvas.addState();
        if (this.canvas.animating) this.canvas.stop();
        if (this.gamePiece) {
            this.canvas.remove(this.gamePiece);
        }
    }

    /**
     * Adds a point to the current path
     * @param {Event} e event
     */
    moving(e) {
        // console.log('move');
        const { x, y } = this.canvas.getXY(e);

        if (this.drawing) {
            this.latestPath.addPoint(x, y);
            this.canvas.context.lineTo(x * this.canvas.canvas.width, y * this.canvas.canvas.height);
            this.canvas.context.stroke();
        }

        if (this.gamePiece) {
            this.gamePiece.moveTo(x, y);
        }
    }

    async save(eventKey, compLevel, matchNumber) {
        return await requestFromServer({
            url: '/match-strategy/save-whiteboard',
            method: 'POST',
            body: {
                whiteboard: this.canvas.stack.toJson(),
                eventKey,
                compLevel,
                matchNumber
            }
        });
    }

    /**
     * Resizes the canvas to the size of the field
     */
    resize() {
        const {
            width,
            height
        } = currentPage.querySelector('#wb--field-view').getBoundingClientRect();
        this.canvas.resize(width, height);

        this.canvas.draw(false);
        const state = this.canvas.stack.currentState;
        if (state) {
            state.content.image.draw(this.canvas);
        }

        if (this.currentMatch) this.setMatch(this.currentMatch);
    }

    // TODO: Implement load
    async load(savedWhiteboard) {
        try {     
            savedWhiteboard = JSON.parse(savedWhiteboard);
            if (savedWhiteboard.states) {
                this.canvas.stack.set(
                    await Promise.all(savedWhiteboard.states.map(async s => {
                        const img = new CanvasImage(s.image.dataUrl);
                        await img.render();
                        return {
                            image: img
                        };
                    })), 
                    savedWhiteboard.currentIndex);
                this.stack.currentState = this.stack.states[this.stack.states.length - 1];
                this.stack.currentStateIndex = this.stack.states.length - 1;

                this.canvas.stack.resolve();
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Sets the the team numbers on the buttons and draws them
     * @param {FIRSTMatch} match custom match object 
     * @returns {void}
     */
    setMatch(match) {
        if (!match) return;
        this.currentMatch = match;

        const teams = [
            ...match.alliances.red.teamKeys.map(t => t.slice(3)),
            ...match.alliances.blue.teamKeys.map(t => t.slice(3))
        ].map(t => currentEvent.teamsObj[t]);

        console.log(teams);

        this.buttons.forEach((b, i) => {
            b.customParameters.robot.setTeam(teams[i]);
            b.addText(teams[i].number, {
                options: {
                    color: Color.fromBootstrap('light').toString('hex'),
                    font: 'Arial',
                    size: 16,
                    rotate: Math.PI / 2,
                }
            });
        });

        this.canvas.draw(false);
    }

    /**
     * Sets the game piece to drag around
     * @param {CustomIcon} svg custom svg icon to drag around 
     */
    async setGamePiece(svg) {
        this.currentRobot = null;
        await svg.render({
            size: 0.1,
            color: svg.color
        });
        this.gamePiece = svg;
    }
}