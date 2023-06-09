let currentEvent;

const selectEvent = new CustomBootstrap.Select(document.querySelector('#tator-events'));
const selectYear = new CustomBootstrap.Select(document.querySelector('#tator-year'));
const newMatchListeners = [];


try {
    const now = new Date();
    const thisYear = now.getFullYear();
    for (let i = thisYear; i >= 2007; i--) {
        selectYear.addOption(i, i, false, new FIRSTYear(i));
    }

    selectYear.on('change', async() => {
        const year = selectYear.value.properties;
        selectEvent.clearOptions();

        await year.getEvents();

        year.events.forEach(event => {
            selectEvent.addOption(event.info.name, event.info.key, false, event);
        });

        let {
            event: foundEvent
        } = selectEvent.options.reduce((acc, o) => {
            const event = o.properties;

            const start = new Date(event.info.startDate);
            // console.log(event.info, start);

            const distance = now - start;
            // console.log(distance);

            // if the event has already started and it's closer than the previous event
            if (distance < acc.distance && distance >= 0) {
                acc.event = event;
                acc.distance = distance;
            }
            return acc;
        }, {
            event: null,
            distance: Infinity
        });

        if (!foundEvent) {
            foundEvent = selectEvent.options[selectEvent.options.length - 1].properties;
            // foundEv
        }

        return await selectEvent.select(foundEvent.info.key);
    });

    selectEvent.on('change', async() => {
        const event = selectEvent.value.properties;
        await event.build();
        currentEvent = event;
        if (currentPage) currentPage.load();
    });

    class TBADataState {
        /**
         * JavaScript doesn't have interfaces so this is just a budget way to do this
         * @param {Node} button A button that can be edited by the state
         */
        constructor (button) {
            /**
             * A button that can be edited by the state
             * @private
             * @type {Node}
             */
            this.button = button;
        }
        /**
         * Triggered when the server receives an update
         * @returns {TBADataState}
         */
        onUpdate () {}
        /**
         * Triggered when this object's button is clicked on
         * @returns {TBADataState}
         */
        onClick () {}
    }

    class TBAUpdater {
        /**
         * Finds the event from the current year that matches a key
         * This is just a static function because I wanted to use this code somewhere completely different
         * @param {string} key The event's key 
         * @returns {FIRSTEvent || undefined}
         */
        static findEvent (key) {
            // getting all the events from the current year 
            const { events } = selectYear.value.properties;

            // Finding the event that matches the key
            return events.find(e => e.info.key == key);
        }

        static Updated = class extends TBADataState {
            /**
             * This will trigger when the state changes to this state
             * @param {Node} button A button that can be edited by the state
             */
            constructor (button) {
                super (button);

                this.button.classList.add("d-none");
            }

            onUpdate (key) {
                console.log("Update ready for event: " + key);
                // Changes the state to NotUpdated
                // Adds the key so it knows which events need to be updated
                return new TBAUpdater.NotUpdated(this.button, [key]);
            }
            
            onClick () {
                // Does nothing because if everything is already updated
                // You don't need any new updates
                // Returns this because the state stays the same
                return this;
            }
        }

        static NotUpdated = class extends TBADataState  {
            /**
             * This will trigger when the state changes to this state
             * @param {Node} button A button that can be edited by the state
             * @param {string[]} keys The keys of the events that need to be updated
             */
            constructor (button, keys) {
                super (button);
                this.keys = keys;

                this.button.classList.remove("d-none");
            }

            onUpdate (key) {
                console.log("Update ready for event: " + key);
                // Adds the key to this updater's list of keys it needs to update
                if (!this.keys.includes(key)) {
                    this.keys.push(key);
                }
                // Returns this because the state stays the same
                return this;
            }
            
            onClick () {
                // Gets the event objects that correspond with each key
                const updateEvents = this.keys.map(key => {
                    return TBAUpdater.findEvent(key);
                }); 

                // removes undefined values and unbuilt events
                // Filters all the the keys so they only include events that have already been built
                // Also removes keys from other years because it isn't that necessary to include them
                const filteredEvents = updateEvents.filter(e => e && e.built);

                filteredEvents.forEach(e => {
                    // Marking that the event isn't build so that it will rebuild
                    e.built = false;

                    // Clearing the event's teams and matches so that they don't get duplicated
                    e.matches = [];
                    e.teams = [];
                    e.build();
                });
                // Changes the state to Updated
                return new TBAUpdater.Updated(this.button);
            }
        }

        constructor (button) {
            this.state = new TBAUpdater.Updated(button);
            
            socket.on("event-update", key => {
                this.onUpdate(key);
            });

            this.button = button;

            this.button.addEventListener('click', _ => {
                this.onClick();
            });
        }

        onUpdate(key) {
            this.state = this.state.onUpdate(key);
        }

        onClick () {
            this.state = this.state.onClick();
        }
    }

    const tbaUpdateButton = document.querySelector("#tba-update");
    const tbaUpdater = new TBAUpdater(tbaUpdateButton);
    socket.on("new-answer", ({ 
        type,
        answer: answerJSON,
        teamNumber,
        compLevel,
        matchNumber,
        eventKey,
        scoutedEvent,
    }) => {
        if (!answerJSON) return;
        const answer = typeof answerJSON == "string" ? JSON.parse(answerJSON) : answerJSON;
        // Getting all of the events so we can find the one that we have received scouting information for
        const events = selectEvent.options.map(option => option.properties);

        // Finding the event which has received scouting
        const event = events.find(e => e.info.key == eventKey);

        // Checking that the event exists
        if (!event) return;

        // Finding the team that the scouting is for
        const team = event.teams.find(t => t.number == teamNumber);

        // Checking that the team exists
        if (!team) return;

        const { tatorInfo } = team;

        // Getting the info that is the same type as tatorInfo
        const info = tatorInfo[type];

        const { matches } = info;
        const questionScouting = new QuestionScouting(answer)


        // Checking if data is an array of each match's data or just data for the team
        if (matches) {
            // Checking if the match has already been scouted
            const existingData = matches.findIndex(m => {
                const { matchInfo } = m.data;
                if (!matchInfo) return;
                return matchInfo.compLevel == compLevel &&
                matchInfo.matchNumber == matchNumber &&
                matchInfo.scoutedEvent == scoutedEvent
        });

            // Updating the match if it has already been scouted
            if (existingData > -1) {
                const { matchInfo } = matches[existingData].data;
                questionScouting.data.matchInfo = matchInfo;
                matches[existingData] = questionScouting;
            }
            // Appending the data if it is an array
            else matches.push(questionScouting);  
        } else {
            // Overriding the data if it is an object
            // (it is already merged other place)
            info.data = answer;
        }
    });

    socket.on("new-questions", ({ 
        eventKey,
        sections,
        type
    }) => {
        const event = TBAUpdater.findEvent(eventKey);

        // if there is no event then you can't edit it's questions
        // and if it isn't build yet then it will just fetch the correct questions anyways
        if (!(event || event.built)) return;

        // Just getting the questions because the sections aren't tracked
        const questions = sections.map(s => s.questions).flat();

        // Setting the event's questions for that category to the correct questions
        // (they are all merged prior to this so you can just set them)
        event[type + "Questions"] = questions;
    });

    socket.on("new-picture", ({ teamNumber, eventKey, id, ext }) => {
        const event = TBAUpdater.findEvent(eventKey);

        // if there is no event then you can't edit it's questions
        // and if it isn't build yet then it will just fetch the correct questions anyways
        if (!(event || event.built)) return;

        const team = event.teams.find(t => t.number == teamNumber);

        if (!team) return;

        // id is the name of the file
        // ext is a file extension ie..png, .jpg
        team.tatorInfo.picture = id + "." + ext;
    });

    socket.on("newMatch", async match => {
        await currentEvent.addMatchScouting(match);

        Promise.all(newMatchListeners.map(async listener => {
            listener();
        }));
    });

    const fullscreenButton = document.querySelector('#open-fullscreen');
    fullscreenButton.addEventListener('click', () => {
        if (currentPage) {
            currentPage.fullscreen();
        } else {
            CustomBootstrap.alert('No page is loaded', {
                color: 'danger'
            });
        }
    });
} catch (e) {}