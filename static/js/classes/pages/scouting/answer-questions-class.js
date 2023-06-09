class AnswerQuestions {
    static trainings = {
        '2022cabl': '<iframe src="https://h5p.org/h5p/embed/1312331" width="1090" height="713" frameborder="0" allowfullscreen="allowfullscreen" allow="geolocation *; microphone *; camera *; midi *; encrypted-media *" title="2022 Rapid React PreScout Strategy Training"></iframe><script src="https://h5p.org/sites/all/modules/h5p/library/js/h5p-resizer.js" charset="UTF-8"></script>'
    }

    /**
     * Populates an entire page with the answer questions creator
     * @param {Node} container Where to put all of the html stuff inside
     * @param {string} name The name of the column inside the teams sql table 
     * @param {boolean} doPictureInput Whether or not this should add an input that will let you submit a picture
     * @param {boolean} doEventSelect Whether this should add a input to select a different event
     * @param {boolean} doMatchSelect Whether this should let you select a match
     * @param {boolean} preScouting Adds certain random things that are only used if this is a preScouting question answerer
     * @param {boolean} doPictureDisplay Adds a modal that will allow you to view an image of the bot
     */
    constructor (name, container, { doPictureInput, doEventSelect, doMatchSelect, doTbaMatchSelect, preScouting, doPictureDisplay }) {
        this.name = name;
        this.container = container;
        this.options = { doPictureInput, doEventSelect, doMatchSelect, doTbaMatchSelect, preScouting, doPictureDisplay };
        this.currentRobots;
        this.currentRobot;
        this.selected = false;
    }

    async onEventChange () {
        if (this.options.doEventSelect) await this.getEvents();

        const { key: eventKey } = currentEvent.info;
    
        await this.getQuestions(eventKey);
    
        const { teams } = currentEvent;
        const _teams = await requestFromServer({ // gets teams with previous answers
            url: `/questions/get-teams`,
            method: 'POST',
            body: {
                eventKey,
                teams: teams.map(t => t.number),
                type: this.name,
            }
        });
    
        this.teamInput.innerHTML = '<option value="!!!"> Select a Team </option>';
        _teams.forEach(team => {
            const option = document.createElement('option');
            option.innerHTML = team.number;
            option.value = team.number;
    
            const info = team[this.name];
            
            if (info && 
                // Object.keys check is to make sure they didn't just enter the name and then submit and image since it still stores name and timestamp
                // This checks whether the is pit scouting, electrical scouting etc on the bot
                (info.timestamp && Object.keys(info).length > 2)
                // this checks for data like pre scouting
                || (Array.isArray(info) && info.length >= 1)) option.classList.add('bg-secondary');
            this.teamInput.appendChild(option);
        });
    
        this.currentRobots = _teams;
    }

    build (container) {
        if (container) this.container = container;
        const { doEventSelect, doPictureInput, doMatchSelect, doTbaMatchSelect, preScouting, doPictureDisplay } = this.options;

        this.nameInputContainer = createElementFromText(`
            <div class="row mb-1">
                <div class="col-12 p-3">
                </div>
            </div>
        `);
            this.nameInputFormGroup = createElementFromText(`
                <div class="form-group">
                    <label class="form-label">Your Name</label>
                </div>
            `);
                this.nameInput = createElementFromText(`<input type="text" class="form-control my-name"placeholder="Dean Kamen">`);
            this.nameInputFormGroup.append(this.nameInput);
        this.nameInputContainer.append(this.nameInputFormGroup);

        this.robotSelectRow = createElementFromText(`<div class="row mb-1"></div>`);
            this.robotSelectContainer = createElementFromText(`<div class="col-${doEventSelect ? 6 : 12} p-3"></div>`);
                this.teamInput = createElementFromText(`<select class="form-select"></select>`);
            this.robotSelectContainer.append(this.teamInput);
        this.robotSelectRow.append(this.robotSelectContainer);

        // This has to trigger before the match select event listeners
        this.teamInput.addEventListener('change', this.onRobotChange.bind(this));

        if (doEventSelect) {
            this.eventSelectContainer = this.robotSelectContainer.cloneNode(false);
                this.eventSelectGroup = createElementFromText(`
                    <div class="input-group mb-3">
                        <span class="input-group-text">Event</span>
                    </div>
                `);
                    this.eventInput = createElementFromText(`
                        <select type="text" class="form-select" aria-label="Event Key"></select>
                    `);
                this.eventSelectGroup.append(this.eventInput);
            this.eventSelectContainer.append(this.eventSelectGroup);
            this.robotSelectRow.append(this.eventSelectContainer);

            if (doTbaMatchSelect) this.eventInput.addEventListener("change", this.updateTbaSelect.bind(this));
        }

        if (doMatchSelect) {
            const inputs = [
                this.teamInput,
            ];

            if (doTbaMatchSelect) {
                this.tbaMatchSelectContainer = createElementFromText(`<div class="col-12 p-3"></div>`)
                    this.tbaMatchSelect = createElementFromText(`
                        <select class = "form-select"></select>
                    `);
                this.tbaMatchSelectContainer.append(this.tbaMatchSelect);
                this.robotSelectRow.append(this.tbaMatchSelectContainer);

                inputs.push(this.tbaMatchSelect);
            } else {
                this.compLevelContainer = createElementFromText(`<div class="col-md-6 col-sm-12 col-xs-12 p-3"></div>`);
                this.compLevelInput = createElementFromText(`
                    <select id="comp-level" class="form-select">
                        <option value="qm">Qualifications</option>
                        <option value="qf">Quarterfinals</option>
                        <option value="sf">Semifinals</option>
                        <option value="f">Finals</option>
                    </select>
                `);
                this.compLevelContainer.append(this.compLevelInput);
                this.matchNumberContainer = this.compLevelContainer.cloneNode(false);
                    this.matchNumberGroup = createElementFromText(`
                        <div class="input-group mb-3">
                            <span class="input-group-text" id="basic-addon1">Match</span>
                        </div>
                    `);
                        this.matchNumberInput = createElementFromText(`
                            <input id="match-number" type="number" class="form-control" placeholder="ex: 23" aria-label="Match Number" aria-describedby="basic-addon1">
                        `);
                    this.matchNumberGroup.append(this.matchNumberInput);
                this.matchNumberContainer.append(this.matchNumberGroup);

                this.robotSelectRow.append(this.compLevelContainer, this.matchNumberContainer);

                
                inputs.push(
                    this.matchNumberInput,
                    this.compLevelInput,
                );
            }

            
            if (doEventSelect) {
                inputs.push(this.eventInput);
            }

            inputs.forEach(input => {
                input.addEventListener('change', async() => {
                    if (!this.currentRobot) return;

                    const { compLevel, matchNumber } = this.selectedMatch;

                    const answers = this.getAnswers(
                        compLevel,
                        matchNumber
                    );
            
                    if (answers) {
                        alert('This match has already been scouted, you can still scout it, but it will overwrite the previous answers.');
            
                        this.updateMatchInfo(answers);
                    } else this.updateMatchInfo({});
                });
            });
        }

        if (doPictureInput) this.createPictureInputs();

        if (doPictureDisplay) {
            this.viewRobotImageContainer = createElementFromSelector(`.col-12.p-3`);
                this.viewRobotImage = CreateQuestions.createIconButton('precision_manufacturing', 'Image of Bot', "primary");
            this.viewRobotImageContainer.append(this.viewRobotImage);

            this.viewRobotImage.addEventListener("click", this.showRobotImageModal.bind(this))

            this.viewRobotImageModal = new CustomBootstrap.Modal({
                title: "Robot Image",
                body: "",
                size: "lg",
            });

            const { body } = this.viewRobotImageModal.subElements;

            this.robotImageModalBody = body;

            this.robotSelectRow.append(this.viewRobotImageContainer);
        }

        this.questionsDiv = createElementFromText(`<div></div>`);
        this.submitAnswerContainer = createElementFromText(`<div class="row p-3"></div>`);
            this.submitAnswerButton = createElementFromText(`<button class="btn btn-primary">Submit</button>`);
        this.submitAnswerContainer.append(this.submitAnswerButton);

        if (preScouting) this.trainingEmbed = createElementFromText(`<div class="row"></div>`);

        const appendElements = [
            this.nameInputContainer,
            this.robotSelectRow,
        ];

        if (doPictureInput) appendElements.push(this.pictureRow);

        appendElements.push(
            this.questionsDiv,
            this.submitAnswerContainer,
        );

        if (preScouting) this.container.append(this.trainingEmbed);

        this.container.append(...appendElements);

        this.submitAnswerButton.addEventListener("click", this.submitAnswer.bind(this));

        if (doPictureInput) this.uploadPictureButton.addEventListener("click", this.savePicture.bind(this));


        // Socket listeners
        
        socket.on("new-answer", this.onNewAnswer.bind(this));
        socket.on("new-questions", this.onNewQuestions.bind(this));
    }

    async getQuestions(eventKey) {
        if (this.preScouting) this.trainingEmbed.innerHTML = AnswerQuestions.trainings[eventKey];
        
        let sections = await requestFromServer({
            url: `/questions/get-sections`,
            method: 'POST',
            body: {
                eventKey,
                type: this.name
            }
        });
        if (!sections || !Array.isArray(sections) || !sections.length) sections = [];

        this.renderSections(sections);
    }

    /**
     * Takes in sections and actually populates them into the questions div
     * @param {Object[]} sections An array of question arrays 
     */
    renderSections(sections) {
        const sectionColors = [{
            background: 'primary',
            text: 'light'
        },
        {
            background: 'secondary',
            text: 'light'
        }, {
            background: 'success',
            text: 'light'
        }, {
            background: 'danger',
            text: 'light'
        }, {
            background: 'warning',
            text: 'dark'
        }, {
            background: 'info',
            text: 'light'
        }, {
            background: 'light',
            text: 'dark'
        }, {
            background: 'dark',
            text: 'light'
        }, {
            background: 'light',
            text: 'dark'
        }, {
            background: 'green',
            test: 'light'
        }, {
            background: 'navy',
            text: 'light'
        }, {
            background: 'indigo',
            text: 'light'
        }, {
            background: 'orange',
            text: 'light'
        }
        ];

        this.questionsDiv.innerHTML = '';
    
        // creates sections
        sections.forEach((section, i) => {
            const sectionColor = sectionColors[i % sectionColors.length];
    
            const { title, questions } = section;
    
            // builds section cards
            const sectionRow = createElementFromSelector('div.row.mb-3.section-row');
            const sectionCol = createElementFromSelector('div.col-12');
            const sectionCard = createElementFromSelector(`div.card.bg-${sectionColor.background}.text-${sectionColor.text}`);
    
            const sectionCardHeader = createElementFromSelector('div.card-header.fw-bold');
            sectionCardHeader.innerHTML = title;
    
            const sectionCardBody = createElementFromSelector('div.card-body.p-0');
            const questionContainer = createElementFromSelector('div.question-container.container-fluid.p-0');
            const questionContainerRow = createElementFromSelector('div.row');
            questionContainer.append(questionContainerRow);
    
            // creates question cards
            questions.forEach(q => {
                const cardCol = createElementFromSelector('div.col-xs-12.col-sm-12.col-md-6.col-lg-4.col-xl-3');
                const card = createElementFromSelector('div.card.p-0.m-1.shadow.text-dark');
                const container = createElementFromSelector('div.container-fluid');
                const cardHeader = createElementFromSelector('div.card-header');
                const cardBody = createElementFromSelector('div.card-body.px-0.py-2');
    
                cardHeader.innerHTML = q.key;
    
                const questionRow = createElementFromSelector('div.row');
    
                const questionCol = createElementFromSelector('div.col-6');
                const question = createElementFromSelector('p.fw-bold');
                question.innerHTML = q.question;
    
                const answerCol = createElementFromSelector('div.col-6');
    
                const answerRow = createElementFromSelector('div.row');
    
                // creates cards depending on type
                switch (q.type) {
                    case 'text':
                        const textInput = createElementFromSelector('input.form-control.answer');
                        textInput.type = 'text';
                        textInput.dataset.type = 'text';
                        textInput.id = q.id;
                        textInput.dataset.key = q.key;
                        answerCol.appendChild(textInput);
                        break;
                    case 'number':
                        const numberInput = createElementFromSelector('input.form-control.answer');
                        numberInput.type = 'number';
                        numberInput.dataset.type = 'number';
                        numberInput.id = q.id;
                        numberInput.dataset.key = q.key;
                        answerCol.appendChild(numberInput);
                        break;
                    case 'boolean':
                        // create checkbox
                        const checkbox = createElementFromSelector('input.form-check-input.answer');
                        checkbox.type = 'checkbox';
                        checkbox.dataset.type = 'boolean';
                        checkbox.id = q.id;
                        checkbox.dataset.key = q.key;
                        answerCol.appendChild(checkbox);
                        break;
                    case 'select':
                        const select = createElementFromSelector('select.form-select.answer');
                        select.id = q.id;
                        select.dataset.key = q.key;
                        select.dataset.type = 'select';
                        q.options.select.forEach(o => {
                            const option = createElementFromSelector('option');
                            option.innerHTML = o.text;
                            select.appendChild(option);
                        });
                        answerCol.appendChild(select);
                        break;
                    case 'radio':
                        q.options.radio.sort((a, b) => a.order - b.order).forEach(o => {
                            const div = createElementFromSelector('div.form-check');
    
                            const radio = createElementFromSelector('input.form-check-input.answer');
                            radio.type = 'radio';
                            radio.dataset.type = 'radio';
                            radio.id = q.id;
                            radio.dataset.key = q.key;
                            radio.value = o.text;
                            radio.name = q.id;
                            div.appendChild(radio);
    
                            const label = createElementFromSelector('label.form-check-label');
                            label.innerHTML = o.text;
                            div.appendChild(label);
    
                            answerCol.appendChild(div);
                        });
                        break;
                    case 'checkbox':
                        q.options.checkbox.sort((a, b) => a.order - b.order).forEach(o => {
                            const div = createElementFromSelector('div.form-check.answer');
    
                            const checkbox = createElementFromSelector(`input.form-check-input.${q.key}-set`);
                            checkbox.type = 'checkbox';
                            div.dataset.type = 'checkbox';
                            div.id = q.id;
                            checkbox.value = o.text;
                            div.dataset.key = q.key;
                            div.appendChild(checkbox);
    
                            const label = createElementFromSelector('label.form-check-label');
                            label.innerHTML = o.text;
                            div.appendChild(label);
    
                            answerCol.appendChild(div);
                        });
                        break;
                    case 'textarea':
                        const textarea = createElementFromSelector('textarea.form-control.answer.w-100');
                        textarea.dataset.type = 'textarea';
                        textarea.id = q.id;
                        textarea.dataset.key = q.key;
                        answerRow.appendChild(textarea);
                        answerCol.classList.remove('col-6');
                        answerCol.classList.add('col-12');
                        const _questionCol = createElementFromSelector('div.col-12');
                        _questionCol.appendChild(question);
                        questionRow.appendChild(_questionCol);
    
                        const descriptionRow = createElementFromSelector('div.row');
                        const descriptionCol = createElementFromSelector('div.col-12');
                        const description = createElementFromSelector('p.small');
                        description.innerHTML = q.description;
    
                        descriptionCol.appendChild(description);
                        descriptionRow.appendChild(descriptionCol);
    
                        container.appendChild(questionRow);
                        container.appendChild(answerRow);
                        container.appendChild(descriptionRow);
    
                        cardBody.appendChild(container);
                        card.appendChild(cardHeader);
                        card.appendChild(cardBody);
                        cardCol.appendChild(card);
                        questionContainerRow.appendChild(cardCol);
                        return;
                    default:
                        break;
                }
    
                // appends question to card
                questionCol.appendChild(question);
                questionRow.appendChild(questionCol);
                questionRow.appendChild(answerCol);
    
                const descriptionRow = createElementFromSelector('div.row');
                const descriptionCol = createElementFromSelector('div.col-12');
                const description = createElementFromSelector('p.small');
                description.innerHTML = q.description;
    
                descriptionCol.appendChild(description);
                descriptionRow.appendChild(descriptionCol);
    
                container.appendChild(questionRow);
                container.appendChild(descriptionRow);
    
                cardBody.appendChild(container);
                card.appendChild(cardHeader);
                card.appendChild(cardBody);
                cardCol.appendChild(card);
    
                questionContainerRow.appendChild(cardCol);
            });
    
            // appends section to page
            sectionCardBody.appendChild(questionContainer);
            sectionCard.appendChild(sectionCardHeader);
            sectionCard.appendChild(sectionCardBody);
            sectionCol.appendChild(sectionCard);
            sectionRow.appendChild(sectionCol); 

            this.questionsDiv.appendChild(sectionRow);
        });
    }

    async getEvents() {
        const year = currentEvent.year.number;
    
        const { events, teams } = await requestFromServer({
            url: '/events/get-all-events',
            method: 'POST',
            body: {
                year,
                eventKey: currentEvent.info.key,
                onlyPrevious: true,
            }
        });

        this.eventInput.innerHTML = `
            <option value="!!!"> Select an Event </option>
        `;
        events.forEach(event => {
            if (event.key == currentEvent.info.key) return;
            const option = document.createElement('option');
            option.value = event.key;
            option.innerHTML = event.name;
            this.eventInput.appendChild(option);
        });
    
        this.events = events;
        this.teams = teams;
    }

    async saveAnswers() {
        const { doEventSelect, doMatchSelect, preScouting } = this.options;

        const answers = {
            scoutName: this.nameInput.value,
            timestamp: new Date().getTime()
        };
    
        if (!answers.scoutName) {
            alert('Please enter your name');
            throw new Error('No scout name');
        }
        
        const teamNumber = this.currentRobot.number;
    
        if (!teamNumber) {
            alert('Please select a team number');
            throw new Error('No team number selected');
        }
    
        this.querySelectorAll('.answer').forEach(a => {
            // pulls data depending on type
            switch (a.dataset.type) {
                case 'text':
                    answers[a.dataset.key] = a.value;
                    a.value = '';
                    break;
                case 'number':
                    answers[a.dataset.key] = a.value;
                    a.value = '';
                    break;
                case 'boolean':
                    answers[a.dataset.key] = a.checked;
                    a.checked = false;
                    break;
                case 'select':
                    answers[a.dataset.key] = a.value;
                    a.value = '';
                    break;
                case 'radio':
                    if (a.checked) {
                        answers[a.dataset.key] = a.value;
                    }
                    a.checked = false;
                    break;
                case 'checkbox':
                    const { key } = a.dataset;
                    if (!answers[key]) {
                        answers[key] = {};
                    }
                    a.querySelectorAll(`.${key}-set`).forEach(c => {
                        answers[key][c.value] = c.checked;
                        c.checked = false;
                    });
                    break;
                case 'textarea':
                    answers[a.dataset.key] = a.value;
                    a.value = '';
                    break;
                default:
                    break;
            }
        });
    
        // Creating an object of all the things you are going to send to the server so that you can add other things
        const body = {
            teamNumber,
            answers,
            eventKey: currentEvent.info.key,
            type: this.name,
        }

        // Changing the event key to the selected event key if the doEventSelect option is enabled
        if (doEventSelect) {
            const scoutedEvent = this.eventInput.value;
    
            if (!scoutedEvent) {
                alert('Please select an event. If you do not see your event, TheBlueAlliance\'s data says your robot is not in that event.');
                throw new Error('Invalid scouted event');
            }

            // Changing the event key to the selected one
            body.scoutedEvent = scoutedEvent;
        }

        if (doMatchSelect) {
            const { compLevel, matchNumber } = this.selectedMatch;

            if (!matchNumber) {
                alert('Please enter a match number');
                throw new Error('Invalid match number');
            }

            if (!compLevel) {
                alert('Please select a competition level');
                throw new Error('Invalid competition level');
            }

            // Adding the comp level and match number to the request
            Object.assign(body, { compLevel, matchNumber });
        }

        await requestFromServer({
            url: `/questions/save-answers`,
            method: 'POST',
            body,
        });
        
        if (!preScouting) { 
            const teamsNodes = Array.from(this.teamInput.childNodes);
            const selectedTeamNode = teamsNodes.find(t => t.value == this.teamInput.value);
            selectedTeamNode.classList.add("bg-secondary");

            this.teamInput.value = '!!!';
            this.currentRobot = undefined;
            this.updateRobotInfo();

        }
    }

    updateRobotInfo () {
        let existingInfo;
        const { options, currentRobot } = this
        if (!options.doMatchSelect) existingInfo = currentRobot ? currentRobot[this.name] : {};
        else {
            const { compLevel, matchNumber } = this.selectedMatch;

            existingInfo = this.getAnswers(
                compLevel,
                matchNumber
            );
        }
        if (!existingInfo) existingInfo = {};
        
        // Auto-populating the name of the scout
        const { scoutName } = existingInfo;
        const { name } = myAccount;
        const { nameInput } = this;
        if (scoutName) {
            if (scoutName.includes(name)) {
                // Keeps the scoutName from the server if the user's name is already in that name
                this.nameInput.value = scoutName;
            } else {
                // Appends the user's name onto the list of scouts
                this.nameInput.value = scoutName + ", " + name;
            }
        } else {
            // Setting the value to name if no scout has already scouted the bot since you aren't going to replace a different scouts name
            this.nameInput.value = name;
        }

        this.querySelectorAll('.answer').forEach(a => {
            const value = existingInfo[a.dataset.key] || "";
            switch (a.dataset.type) {
                case 'text':
                    a.value = value;
                    break;
                case 'number':
                    a.value = value;
                    break;
                case 'boolean':
                    a.checked = existingInfo[a.dataset.key];
                    break;
                case 'select':
                    a.value = value;
                    break;
                case 'radio':
                    a.checked = existingInfo[a.dataset.key] == a.value;
                    break;
                case 'checkbox':
                    const { key } = a.dataset;
                    a.querySelectorAll(`.${key}-set`).forEach(c => {
                        c.checked = existingInfo[key][c.value];
                    });
                    break;
                case 'textarea':
                    a.value = value;
                    break;
                default:
                    break;
            }
        });
    }

    onRobotChange () {
        const { value: teamNumber } = this.teamInput;

        if (teamNumber === '!!!') {
            this.currentRobot = undefined;
            return;
        }
    
        this.currentRobot = this.currentRobots.find(r => r.number == teamNumber);
    
        this.updateRobotInfo();
        
        const { doEventSelect, doTbaMatchSelect } = this.options;

        if (doEventSelect) this.updateEventSelect();
        if (doTbaMatchSelect) this.updateTbaSelect();
    }

    /**
     * Gets the answers for the a match and the selected robot
     * Returns undefined if doMatchSelect is disabled or not all of the input are filled out
     * @param {string} findCompLevel The comp level to get answers for
     * @param {number} findMatchNumber The match number to get answers for
     * @returns {undefined || Object}
     */
    getAnswers (findCompLevel, findMatchNumber) {
        const { doMatchSelect, doEventSelect } = this.options;
        if (!doMatchSelect) return;

        if (!this.currentRobot) return;
        const info = this.currentRobot[this.name];
        if (!Array.isArray(info)) return;

        const answers = info.find(el => {
            const { matchInfo } = el;
            if (!matchInfo) return;
            const { compLevel, matchNumber, scoutedEvent } = matchInfo;
            if (doEventSelect && this.eventInput.value != scoutedEvent) return;
            if (findMatchNumber != matchNumber) return;
            if (findCompLevel != compLevel) return;
            return true;
        }); 

        return answers;
    }

    /**
     * Sets answers to a new value
     */
    setAnswers (findCompLevel, findMatchNumber, findScoutedEvent, answers) {
        const { doMatchSelect, doEventSelect } = this.options;
        if (!doMatchSelect) return;
        const info = this.currentRobot[this.name];
        if (!Array.isArray(info)) return;

        const answersIndex = info.findIndex(el => {
            const { matchInfo } = el;
            if (!matchInfo) return;
            const { compLevel, matchNumber, scoutedEvent } = matchInfo;
            if (doEventSelect && findScoutedEvent != scoutedEvent) return;
            if (findMatchNumber != matchNumber) return;
            if (findCompLevel != compLevel) return;
            return true;
        }); 

        if (answersIndex > -1) info[answersIndex] = answers;
        // return answers;
    }

    /**
     * Populates the tba select dropdown with all of the select team's matches formatted as `compLevel - matchNumber`.
     */
    updateTbaSelect () {
        if (!this.currentRobot) return;
        let matches; 
        if (this.options.doEventSelect) {
            const { value } = this.eventInput;

            if (!value || value == "!!!") return;

            const event = this.events.find(e => {
                return e.key == value;
            });

            const frcKey = "frc" + this.currentRobot.number;

            const teamMatches = event.matches.filter(m => {
                const { red, blue } = m.alliances;
                const hasTeam = [red, blue].reduce((acc, alliance) => {
                    return acc || alliance.team_keys.find(teamKey => {
                        return teamKey == frcKey;
                    })
                }, false);

                return hasTeam;
            });

            matches = teamMatches.map(m => {
                return {
                    matchNumber: m.match_number,
                    compLevel: m.comp_level
                }
            });
        } else {
            // teamsObj is an object where each key is a team's number and the value is that team
            const { teamsObj } = currentEvent;
            // gets the FIRSTTeam object for the selected team
            const tbaTeam = teamsObj[this.currentRobot.number];
            // Getting the team's matches according to the blue alliance
            matches = tbaTeam.matches;
        }

        this.tbaMatchSelect.innerHTML = "";
        matches.forEach(m => {
            const { matchNumber, compLevel } = m;
            const answers = this.getAnswers(compLevel, matchNumber);

            const value = compLevel + "-" + matchNumber;

            const option = document.createElement('option');
            option.innerHTML = value;
            option.value = value;
    
            if (answers) option.classList.add('bg-secondary');
            this.tbaMatchSelect.appendChild(option);
        });
    }

    async updateEventSelect () {
        if (!currentEvent) return;
    
        console.log(this.teams);
        const team = this.teams.find(t => t.team_number == +this.teamInput.value);
        if (!team) await this.getEvents();
        this.eventInput.innerHTML = `
            <option value="!!!"> Select an Event </option>
        `;
    
        const matches = this.currentRobot[this.name];
        team.events.forEach(event => {
            const option = document.createElement('option');

            const { key } = event;
            option.value = key;
            option.innerHTML = event.name;

            matches.forEach(match => {
                const { matchInfo } = match;
                const { scoutedEvent } = matchInfo;

                if (scoutedEvent == key) option.classList.add('bg-secondary');
            });

            this.eventInput.appendChild(option);
        });
    }

    async submitAnswer () {
        const { doPictureInput, doEventSelect, doMatchSelect } = this.options;

        if (doPictureInput) this.savePicture();
        const answers = await this.saveAnswers();
    
        if (!answers) return;
    
        this.teamInput.querySelector(`option[value="${currentRobot.number}"]`).classList.add('bg-secondary');
    
        this.currentRobot[this.name] = answers;

        // replace currentRobots[index] with currentRobot
        const index = this.currentRobots.findIndex(r => r.number == this.currentRobot.number);
        this.currentRobots[index] = this.currentRobot;

        if (doEventSelect) {
            this.eventInput.value = '';
        }

        if (doMatchSelect) {
            this.selectedMatch = {};
        }
    
    }

    /**
     * A function that is called when a socket listener receives that someone else answered a question
     */
    onNewAnswer ({ type, answer, teamNumber, eventKey, compLevel, matchNumber, scoutedEvent }) {
        // Checking if they event answered the same question type
        if (type != this.name) return; 
        // Checking that the scouting is for the same event
        if (eventKey != currentEvent.info.key) return;

        if (!this.currentRobots) return;

        const optionsArray = Array.from(this.teamInput.childNodes);

        optionsArray.forEach(option => {
            const { value } = option;

            if (value != teamNumber) return;

            // Object.keys check is to make sure they didn't just enter the name and then submit and image since it still stores name and timestamp
            if (answer && answer.timestamp && Object.keys(answer).length > 2) option.classList.add('bg-secondary');
        });

        const answerTeam = this.currentRobots.find(r => r.number == teamNumber);

        const data = answerTeam[this.name];

        if (Array.isArray(data)) data.push(answer);
        else answerTeam[this.name] = answer;

        if (this.currentRobot && teamNumber == this.currentRobot.number) this.updateRobotInfo();
        else return;
        if (this.options.doMatchSelect) {
            answer.matchInfo = {
                compLevel,
                matchNumber,
                scoutedEvent,
                teamNumber,
            }
            this.setAnswers(compLevel, matchNumber, scoutedEvent, answer);

            this.updateMatchInfo(answer);
        }
    }

    onNewQuestions({ type, eventKey, sections }) {
        if (type != this.name) return;
        if (currentEvent.info.key == eventKey) {
            this.renderSections(sections);
        }
    }

    setMatchInfo(matchInfo) {
        const { doEventSelect, doMatchSelect } = this.options;
        const { teamNumber } = matchInfo;
        this.teamInput.value = teamNumber;
        this.teamInput.dispatchEvent(new Event("change"));

        if (doMatchSelect) {
            const { matchNumber, compLevel } = matchInfo;

            this.selectedMatch = {
                compLevel,
                matchNumber
            }
        }
        
        if (doEventSelect) {
            const { scoutedEvent } = matchInfo;
            this.eventInput.value = scoutedEvent;
            this.eventInput.dispatchEvent(new Event('change'));
        }
    }

    async savePicture() {
        if (!this.currentRobot) return alert('Please select a team');
        await fileStream('/questions/save-picture', this.pictureInput, {
            headers: {
                teamNumber: this.currentRobot.number,
                eventKey: currentEvent.info.key,
                type: this.name
            }
        });

        this.pictureInput.value = '';
        this.currentRobot = null;
        this.teamInput.value = '!!!';
    }

    /**
     * Only query selects from within this's container
     * @param {string} query A DOM query
     * @returns {Node}
     */
    querySelector (query) {
        return this.container.querySelector(query);
    }

    /**
     * Only query selects from within this's container
     * @param {string} query A DOM query
     * @returns {Node}
     */
    querySelectorAll (query) {
        return this.container.querySelectorAll(query);
    }

    createPictureInputs () {
        this.pictureRow = createElementFromText(`<div class="row mb-1"></div>`);
            this.pictureInputCol = createElementFromText(`
                <div class="col-6 p-3">
                    <label class="form-label">Upload Robot Picture</label>
                </div>
            `);
                this.pictureInput = createElementFromText(`<input type="file" class="form-control">`);
            this.pictureInputCol.append(this.pictureInput);
            this.uploadPictureButtonCol = createElementFromText(`<div class="col-6 p-3 d-flex align-items-end"></div>`);
                this.uploadPictureButton = createElementFromText(`<button class="btn btn-success w-100">Upload Only Picture</button>`);
            this.uploadPictureButtonCol.append(this.uploadPictureButton);
        this.pictureRow.append(this.pictureInputCol, this.uploadPictureButtonCol);
    }

    showRobotImageModal () {
        this.viewRobotImageModal.show();
        const { teams } = currentEvent;
        if (!this.currentRobot) {
            this.robotImageModalBody.innerHTML = "No robot selected";
            return;
        }
        const team = teams.find(t => t.number == this.currentRobot.number);
        if (!team) {
            this.robotImageModalBody.innerHTML = "Image not found.";
            return;
        }
        const { picture } = team.tatorInfo;
        if (!picture) {
            this.robotImageModalBody.innerHTML = "Image not found."
            return;
        }

        this.robotImageModalBody.innerHTML = "";

        const image = new Image();
        image.src = "../uploads/" + picture;
        image.classList.add("img-thumbnail")

        this.robotImageModalBody.append(image);

        // image.onload = _ => {
        // }
    }

    /**
     * Updates the match info by filling in all of the questions
     * @param {Object} answers An object with question: answer pairs 
     */
    updateMatchInfo(answers) {
        this.querySelectorAll('.answer').forEach(a => {
            switch (a.dataset.type) {
                case 'checkbox':
                    const { key } = a.dataset;
                    a.querySelectorAll(`.${key}-set`).forEach(c => {
                        c.checked = answers[key] ? answers[key][c.value] : false;
                    });
                    break;
                case 'radio':
                    const { dataset: { key: _key }, value } = a;
                    a.checked = answers[_key] == value;
                    break;
                case 'boolean':
                    const { dataset: { key: __key } } = a;
                    a.checked = answers[__key];
                default:
                    a.value = answers[a.dataset.key] || '';
                    break;
            }
        });
    }

    /**
     * Which match number and compLevel you have selected (doesn't work if you don't have doMatchSelect enabled)
     * @type {{ matchNumber: number, compLevel: string }}
     */
    get selectedMatch() {
        const { doMatchSelect, doTbaMatchSelect } = this.options;
        if (!doMatchSelect) return;
        if (doTbaMatchSelect) {
            const { value } = this.tbaMatchSelect;
            if (!value) return {
                compLevel: "",
                matchNumber: "",
            };
            const [ compLevel, matchNumber ] = value.split("-");

            return {
                compLevel,
                matchNumber: +matchNumber,
            }
        } else {
            return {
                compLevel: this.compLevelInput.value,
                matchNumber: this.matchNumberInput.value,
            }
        }
    }

    set selectedMatch (match) {
        const { doMatchSelect, doTbaMatchSelect } = this.options;
        if (!doMatchSelect) return;

        const { compLevel, matchNumber } = match;

        if (doTbaMatchSelect) {
            if (!compLevel || matchNumber) return this.tbaMatchSelect.value = "";
            const newValue = compLevel + "-" + matchNumber;
            this.tbaMatchSelect.value = newValue;
        } else {
            this.compLevelInput.value = compLevel || "";
            this.matchNumberInput.value = matchNumber || "";
        }
    }
}
