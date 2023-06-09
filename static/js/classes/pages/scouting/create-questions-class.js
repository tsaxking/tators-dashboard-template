class CreateQuestions {
    static questionTypes = [
        {
            label: 'Text',
            type: 'string',
            name: 'text'
        },
        {
            label: 'Number',
            type: 'number',
            name: 'number'
        },
        {
            label: 'Checkbox',
            type: 'boolean',
            name: 'checkbox'
        },
        {
            label: 'Radio',
            type: 'string',
            name: 'radio'
        },
        {
            label: 'Select',
            type: 'string',
            name: 'select'
        }
    ];

    // The html for a display of the current event (this may not be used anymore)
    static currentEventDisplay = 
        `
            <div class="row">
                <h3 class="current-event"></h3>
            </div>
        `

    // Question Card
    static questionHTML = `
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-6 mb-2">
            <div class="card question-card p-0 shadow">
                <div class="card-header">
                    <div class="d-flex justify-content-between">
                        <h4 id="card-title" class="card-title"></h4>
                        <div class = "btn btn-group">
                            <button class="btn btn-primary up-question"> <span class = "material-icons">arrow_upward</span></button>
                            <button class="btn btn-info down-question"> <span class = "material-icons">arrow_downward</span></button>

                            <button class="btn btn-danger remove-question" id="remove-question">
                                <i class="material-icons">close</i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="container-fluid">
                        <div class="row mb-1">
                            <div class="col-4 d-flex flex-column-reverse align-items-end">
                                <h5 class="mb-0">Question: </h5>
                            </div>
                            <div class="col-8">
                                <input type="text" class="form-control question" id="question">
                            </div>
                        </div>
                        <div class="row mb-1">
                            <div class="col-4 d-flex flex-column-reverse align-items-end">
                                <h5 class="mb-0">Question Key: </h5>
                            </div>
                            <div class="col-8">
                                <input type="text" class="form-control key" id="key">
                            </div>
                        </div>
                        <div class="row mb-1">
                            <div class="col-4 d-flex flex-column-reverse align-items-end">
                                <h5 class="mb-0">Description: </h5>
                            </div>
                            <div class="col-8">
                                <textarea type="text" class="form-control description" id="description"></textarea>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <div class="col-4 d-flex flex-column-reverse align-items-end">
                                <h5 class="mb-0">Type: </h5>
                            </div>
                            <div class="col-8">
                                <select id="type" class="form-select type">
                                    <option value="text">Text</option>
                                    <option value="textarea">Textarea</option>
                                    <option value="number">Number</option>
                                    <option value="checkbox">Checkbox</option>
                                    <option value="radio">Radio</option>
                                    <option value="select">Select</option>
                                    <option value="boolean">Boolean</option>
                                </select>
                            </div>
                        </div>
                        <div class="row d-none radio-row" id="radio-row">
                            <div class="container-fluid">
                                <div class="row mb-1">
                                    <h5 class="text-center">Radio Buttons: </h5>
                                </div>
                                <div class="row radio-buttons" id="radio-buttons"></div>
                                <div class="row">
                                    <button class="btn btn-primary add-radio" id="add-radio">Add Radio Button</button>
                                </div>
                            </div>
                        </div>
                        <div class="row d-none checkbox-row" id="checkbox-row">
                            <div class="container-fluid">
                                <div class="row mb-1">
                                    <h5 class="text-center">Checkbox Buttons: </h5>
                                </div>
                                <div class="row checkbox-buttons" id="checkbox-buttons"></div>
                                <div class="row">
                                    <button class="btn btn-primary add-checkbox" id="add-checkbox">Add Checkbox Button</button>
                                </div>
                            </div>
                        </div>
                        <div class="row d-none select-row" id="select-row">
                            <div class="container-fluid">
                                <div class="row mb-1">
                                    <h5 class="text-center">Options: </h5>
                                </div>
                                <div class="row select-options" id="select-options"></div>
                                <div class="row">
                                    <button class="btn btn-primary add-select-option" id="add-select-option">Add Option</button>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input small-question" id="small-question">
                                <label class="form-check-label">Show on summary</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // section card
    static sectionHTML = `
        <div class="row mb-3 section">
            <div class="card p-0 bg-gray-light">
                <div class="card-header">
                    <div class="row">
                        <div class="col">
                            <h5 class="card-title">Section #<span id="section-number"></span></h5>
                        </div>
                        <div class="col">
                            <button class="btn btn-danger" id="remove-section">Remove</button>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="container-fluid p-0">
                        <div class="row mb-1">
                            <div class="col">
                                <div class="input-group">
                                    <label class="input-group-text">Section Title</label>
                                    <input type="text" class="form-control" id="section-title">
                                </div>
                            </div>
                            <div class="col">
                                <button class="btn-primary btn" id="add-question">
                                    <i class="material-icons">add</i>
                                    Add Question
                                </button>
                            </div>
                        </div>
                        <div class="row" id="question-container"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // An input to select an event (this wasn't working before I added it so I just added the input but it has no functionality)
    static eventInput = `<select name="" class="form-select"></select>`;

    // static events = [];

    // This is used in pit-scouting.js
    static async onYearChange () {
        const { info } = currentEvent;

        const eventRequests = new Array(2).fill().map(async (_, i) => {
            return requestFromServer({
                url: 'events/get-tator-events/',
                body: {
                    year: info.year - i,
                }
            })
        });

        const events = await Promise.all(eventRequests);

        CreateQuestions.events = events.flat();
    }

    /**
     * Creates a Button el with a text and material icon
     * @param {string} icon The name of the material icon 
     * @param {string} text The text to put after the material icon 
     * @param {string} color The bootstrap name of the color you want the button to be
     * @returns {Node}
     */
    static createIconButton (icon, text, color) {
        return createElementFromText(`
            <button class="btn btn-${color}">
                <i class="material-icons">${icon}</i>${text}
            </button>
        `);
    }

    /**
     * Runs all the interact code since interact isn't defined till after this code runs
     * @returns {void}
     */
    static runInteract () {
        if (!interact) return;
        // interact.js question-card
        interact('.question-card')
            .draggable({
                allowFrom: '.drag',
                inertia: false,
                restrict: {
                    restriction: 'parent',
                    elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
                    endOnly: true
                },
                autoScroll: true,
                onmove: (e) => {
                    const target = e.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + e.dx;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + e.dy;

                    target.style.webkitTransform = target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                },
                onstart: (e) => {
                    e.target.classList.add('bg-secondary');
                },
                onend: (e) => {
                    e.target.classList.remove('bg-secondary');

                    // reset position
                    e.target.style.webkitTransform = e.target.style.transform = `translate(0px, 0px)`;
                }
            });

        // dropzone for questions
        interact('.question-card')
            .dropzone({
                accept: '.question-card',
                overlap: 0.75,
                ondropactivate: (e) => {
                    e.target.classList.add('drop-active');
                    e.relatedTarget.classList.remove('bg-secondary');
                    e.relatedTarget.classList.add('bg-primary');
                },
                ondragenter: (e) => {
                    e.target.classList.add('drop-target');
                    e.relatedTarget.classList.remove('bg-secondary');
                    e.relatedTarget.classList.add('bg-primary');
                },
                ondragleave: (e) => {
                    e.target.classList.remove('drop-target');
                    e.relatedTarget.classList.remove('bg-primary');
                },
                ondrop: (e) => {
                    const target = e.target;
                    const question = e.relatedTarget;
                    const targetParent = target.parentNode;
                    const questionParent = question.parentNode;

                    targetParent.insertBefore(question, target);
                    questionParent.insertBefore(target, question);

                    target.classList.remove('drop-target');
                    e.relatedTarget.classList.remove('bg-secondary');
                    e.relatedTarget.classList.remove('bg-primary');
                },
                ondropdeactivate: (e) => {
                    e.target.classList.remove('drop-active');
                    e.target.classList.remove('drop-target');
                    e.relatedTarget.classList.remove('bg-secondary');
                    e.relatedTarget.classList.remove('bg-primary');
                }
            });
            
        // Making the function do nothing so it won't get run again.
        CreateQuestions.runInteract = _ => {};
    }

    /**
     * Returns a uuid for this client
     * @returns {String}
     */
    static async getNewId() {
        return await requestFromServer({
            url: '/get-id',
            method: 'POST'
        });
    }

    // for radio inputs
    static createRadio = () => {
        const radioCol = createElementFromSelector('div.col-md-6.col-sm-12.d-flex.justify-content-center.align-items-center.mb-1.radio-col');

        const removeButton = document.createElement('button');
        removeButton.classList.add('btn', 'btn-danger', 'h-100', 'm-0');
        // removeButton.classList.add('col-3');
        removeButton.innerHTML = `
            <i class="material-icons">close</i>
        `;

        removeButton.addEventListener('click', () => {
            radioCol.remove();
        });

        const input = document.createElement('input');
        input.classList.add('form-control', 'h-100', 'm-0');
        // input.classList.add('col-9');
        input.placeholder = 'Radio Button Text';
        input.type = 'text';

        radioCol.appendChild(removeButton);
        radioCol.appendChild(input);

        return radioCol;
    }

    // for checkbox inputs
    static createCheckbox = () => {
        const checkboxCol = createElementFromSelector('div.col-md-6.col-sm-12.d-flex.justify-content-center.align-items-center.mb-1.checkbox-col');

        const removeButton = document.createElement('button');
        removeButton.classList.add('btn', 'btn-danger', 'h-100', 'm-0');
        // removeButton.classList.add('col-3');
        removeButton.innerHTML = `
            <i class="material-icons">close</i>
        `;
        removeButton.addEventListener('click', () => {
            checkboxCol.remove();
        });

        const input = document.createElement('input');
        input.classList.add('form-control', 'h-100', 'm-0');
        // input.classList.add('col-9');
        input.placeholder = 'Checkbox Button Text';
        input.type = 'text';

        checkboxCol.appendChild(removeButton);
        checkboxCol.appendChild(input);

        return checkboxCol;
    }

    // for select inputs
    static createSelect = () => {
        const selectCol = createElementFromSelector('div.col-md-6.col-sm-12.d-flex.justify-content-center.align-items-center.mb-1.select-col');

        const removeButton = document.createElement('button');
        removeButton.classList.add('btn', 'btn-danger', 'h-100', 'm-0');
        // removeButton.classList.add('col-3');
        removeButton.innerHTML = `
            <i class="material-icons">close</i>
        `;
        removeButton.addEventListener('click', () => {
            selectCol.remove();
        });

        const input = document.createElement('input');
        input.classList.add('form-control', 'h-100', 'm-0');
        // input.classList.add('col-9');
        input.placeholder = 'Option Text';
        input.type = 'text';

        selectCol.appendChild(removeButton);
        selectCol.appendChild(input);

        return selectCol;
    }

    // test for type of question (value)
    static mainTypeTest = (value, q, questionRow) => {
        switch (value) {
            case 'radio':
                questionRow.querySelector('#radio-row').classList.remove('d-none');
                questionRow.querySelector('#checkbox-row').classList.add('d-none');
                questionRow.querySelector('#select-row').classList.add('d-none');

                questionRow.querySelector('#radio-buttons').innerHTML = '';

                if (!q.options.radio || !q.options.radio.length) {
                    questionRow.querySelector('#radio-buttons').appendChild(this.createRadio());
                }

                q.options.radio.sort((a, b) => a.order - b.order).forEach(r => {
                    questionRow.querySelector('#radio-buttons').appendChild(this.createRadio());

                    const lastRadio = questionRow.querySelector('#radio-buttons').lastChild;
                    lastRadio.querySelector('input').value = r.text;
                });
                break;
            case 'checkbox':
                questionRow.querySelector('#checkbox-row').classList.remove('d-none');
                questionRow.querySelector('#radio-row').classList.add('d-none');
                questionRow.querySelector('#select-row').classList.add('d-none');

                questionRow.querySelector('#checkbox-buttons').innerHTML = '';

                if (!q.options.checkbox || !q.options.checkbox.length) {
                    questionRow.querySelector('#checkbox-buttons').appendChild(this.createCheckbox());
                }

                q.options.checkbox.sort((a, b) => a.order - b.order).forEach(r => {
                    questionRow.querySelector('#checkbox-buttons').appendChild(this.createCheckbox());

                    const lastCheckbox = questionRow.querySelector('#checkbox-buttons').lastChild;
                    lastCheckbox.querySelector('input').value = r.text;
                });
                break;
            case 'select':
                questionRow.querySelector('#select-row').classList.remove('d-none');
                questionRow.querySelector('#radio-row').classList.add('d-none');
                questionRow.querySelector('#checkbox-row').classList.add('d-none');

                questionRow.querySelector('#select-options').innerHTML = '';

                if (!q.options.select || !q.options.select.length) {
                    questionRow.querySelector('#select-options').appendChild(this.createSelect());
                }

                q.options.select.sort((a, b) => a.order - b.order).forEach(r => {
                    questionRow.querySelector('#select-options').appendChild(this.createSelect());

                    const lastSelectOption = questionRow.querySelector('#select-options').lastChild;
                    lastSelectOption.querySelector('input').value = r.text;
                });
                break;
            default:
                questionRow.querySelector('#radio-row').classList.add('d-none');
                questionRow.querySelector('#checkbox-row').classList.add('d-none');
                questionRow.querySelector('#select-row').classList.add('d-none');
                break;
        }
    }

    /**
     * Populates an entire page with the questions creator
     * @param {Node} container Where to put all of the html stuff inside
     * @param {string} name The name of the column inside the teams sql table 
     */
    constructor (container, name) {
        // Tries to run the interact code since interact is imported after this class is defined so we can't just run it staticly
        CreateQuestions.runInteract();
        this.container = container;
        this.name = name;
        this.selected = false;
        this.init, this.numQuestions;
    }
    
    /**
     * Runs getPitScoutQuestions and removes this eventListener until getPitScoutQuestions is done running
     */
    async onEventChange () {
        const { key } = currentEvent.info;
        // Removes the event listener then adds it back after the function is completed since them running at the same time caused them to both clear the contents of the Node they were appending sections to at the same time and then append new sections after both clears had run which effectively doubled how many sections there were.
        // eventChangeListeners.splice(eventChangeListeners.indexOf(this.onEventChange.bind(this)), 1);
        await this.getQuestions(key, true);
        // eventChangeListeners.push(this.onEventChange.bind(this));
        this.eventInput.value = key
    }

    setQuestions (sections, clearSections) {
        this.numQuestions = 0;

        const { createRadio, createCheckbox, createSelect, mainTypeTest } = CreateQuestions;

        // creates question card
        const addQuestion = (section, question) => {
            const questionRow = createElementFromText(CreateQuestions.questionHTML);
            questionRow.querySelector('#card-title').innerHTML = `Question #${++this.numQuestions}`;
            // questionRow.querySelector('.card').id = question ? question.id : await CreateQuestions.getNewId();;

            const questionContainer = section.querySelector('#question-container')

            const moveQuestion = direction => {
                // Getting all of the childNodes of questionContainer
                const { children } = questionContainer;
                // Turning it into an array so we can use indexOf
                const childrenArray = Array.from(children);
                // Getting the index of the row
                const index = childrenArray.indexOf(questionRow);
                
                // Moving the row before a node x away from it where x is the direction
                questionContainer.insertBefore(questionRow, children[index + direction]);
            }

            // Direction is negative 2 because it is inserting before so we want to insert the node in front of that node
            questionRow.querySelector(".up-question").addEventListener("click", _ => moveQuestion(-1));
            // Direction is positive 1 because it is inserting before the node one after this node
            questionRow.querySelector(".down-question").addEventListener("click", _ => moveQuestion(2));

            questionRow.querySelector('#remove-question').addEventListener('click', () => {
                questionRow.remove();
            });
            if (question) {
                questionRow.querySelector('#question').value = question.question;
                questionRow.querySelector('#key').value = question.key;
                questionRow.querySelector('#description').value = question.description;
                questionRow.querySelector('#type').value = question.type;
            }
    
            questionRow.querySelector('#type').addEventListener('change', (e) => {
                if (question) {
                    mainTypeTest(e.target.value, question, questionRow);
                } else {
                    mainTypeTest(e.target.value, {
                        options: {
                            radio: [],
                            checkbox: [],
                            select: []
                        }
                    }, questionRow);
                }
            });

            if (question) mainTypeTest(question.type, question, questionRow);

            // add listeners to type buttons
            questionRow.querySelector('#add-radio').addEventListener('click', () => {
                questionRow.querySelector('#radio-buttons').appendChild(createRadio());
            });

            questionRow.querySelector('#add-checkbox').addEventListener('click', () => {
                questionRow.querySelector('#checkbox-buttons').appendChild(createCheckbox());
            });
    
            questionRow.querySelector('#add-select-option').addEventListener('click', () => {
                questionRow.querySelector('#select-options').appendChild(createSelect());
            });
    
            questionContainer.appendChild(questionRow);
        }

        let numSections = 0;


        // creates section card
        const addSection = _ => {
            const section = createElementFromText(CreateQuestions.sectionHTML);
            // section.querySelector('.card').id = await CreateQuestions.getNewId();
            section.querySelector('#section-number').innerHTML = ++numSections;
            section.querySelector('#remove-section').addEventListener('click', () => {
                section.remove();
            });

            section.querySelector('#add-question').addEventListener('click',
                () => {
                    addQuestion(section);
                });

            this.sectionContainer.appendChild(section);

            return section;
        }

        if (clearSections) this.sectionContainer.innerHTML = '';
    
        // builds each section
        for (const s of sections) {
            const { title, questions } = s;
    
            const section = addSection();
    
            section.querySelector('#section-title').value = title;
    
            // loops through each question in the section
            questions.forEach(q => {
                addQuestion(section, q);
            });

        }

        if (!this.init) this.addSection.addEventListener('click', addSection);
        this.init = true;
    }

    /**
     * Adds all of the existing questions and sets up the add buttons
     * @param {string} eventKey The key to the event you want to add sections for
     * @param {boolean} clearSections Whether or not you should remove the existing sections
     */
    async getQuestions(eventKey, clearSections) {    
        let sections = await requestFromServer({
            url: `/questions/get-sections`,
            method: 'POST',
            body: {
                eventKey,
                type: this.name,
            }
        });
    
        if (!sections || !Array.isArray(sections) || !sections.length) sections = [];

        this.setQuestions(sections, clearSections);
    }

    async onYearChange () {
        this.eventInput.innerHTML = '';

        const options = CreateQuestions.events.map(event => {
            const { key } = event.info;
            const option = createElementFromText(`<option value = "${key}" >${key}</option>`);
            return option;
        });

        this.eventInput.append(...options); 
        
        const { info } = currentEvent;
        this.eventInput.value = info.key;
    }

    /**
     * Saves all of the sections to the server
     */
    saveSections() {
        requestFromServer({
            url: `/questions/save-sections`,
            method: 'POST',
            body: {
                sections: this.getQuestionData(),
                eventKey: currentEvent.info.key,
                type: this.name,
            }
        });
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
    
    /**
     * Gets all of the questions as the format that they should be when they are sent to the server;
     * @returns {{ title: string, questions: Object[] }[]}
     */
    getQuestionData() {
        const sections = [];

        this.querySelectorAll('.section').forEach(s => {
            const section = {
                title: s.querySelector('#section-title').value,
                questions: []
            };


            s.querySelectorAll('.question-card').forEach(questionCard => {
                const question = {
                    question: questionCard.querySelector('#question').value,
                    key: questionCard.querySelector('#key').value,
                    description: questionCard.querySelector('#description').value,
                    type: questionCard.querySelector('#type').value,
                    small: questionCard.querySelector('#small-question').value,
                    // id: questionCard.id,
                    options: {
                        radio: [],
                        checkbox: [],
                        select: []
                    }
                };

                // submits based on type
                switch (question.type) {
                    case 'radio':
                        questionCard.querySelectorAll('#radio-buttons .radio-col').forEach((radioCol, i) => {
                            question.options.radio.push({
                                text: radioCol.querySelector('input').value,
                                order: i
                            });
                        });
                        break;
                    case 'checkbox':
                        questionCard.querySelectorAll('#checkbox-buttons .checkbox-col').forEach((checkboxCol, i) => {
                            question.options.checkbox.push({
                                text: checkboxCol.querySelector('input').value,
                                order: i
                            });
                        });
                        break;
                    case 'select':
                        questionCard.querySelectorAll('#select-options .select-col').forEach((selectCol, i) => {
                            question.options.select.push({
                                text: selectCol.querySelector('input').value,
                                order: i
                            });
                        });
                        break;
                }
                section.questions.push(question);
            });

            sections.push(section);
        });
        return sections;
    }

    /**
     * Creates all of the html elements and adds them to the container
     */
    build (container) {
        if (container) this.container = container;

        // // TODO: implement undo/redo
        // this.undoButton = document.querySelector('#undo');
        // this.redoButton = document.querySelector('#redo');

        // This formatting is supposed to make it easier to visualize what the html will look like but you can change it back if it makes it harder to read

        this.currentEventDisplay = createElementFromText(CreateQuestions.currentEventDisplay);

        this.saveAndEventContainer = createElementFromSelector(`div.row.mb-1`);
            this.saveButtonContainer = createElementFromSelector(".col-md-1.col-sm-2");
                this.saveButton = CreateQuestions.createIconButton("save", "", "success");

                // saves the form
                this.saveButton.addEventListener('click', this.saveSections.bind(this));
            this.saveButtonContainer.append(this.saveButton);

            this.eventInputContainer = createElementFromSelector('.col-md-4.col-sm-6');
                this.eventInput = createElementFromText(CreateQuestions.eventInput);
            this.eventInputContainer.append(this.eventInput);
            this.importEventContainer = createElementFromSelector('.col-md-7.col-sm-12');
                this.importEvent = CreateQuestions.createIconButton("add", "Import event's questions", "primary");
            this.importEventContainer.append(this.importEvent);
        this.saveAndEventContainer.append(this.saveButtonContainer, this.eventInputContainer, this.importEventContainer);

        this.sectionContainerRow = createElementFromSelector(`div.row`);
            this.sectionContainer = createElementFromSelector(`div.container`);
        this.sectionContainerRow.appendChild(this.sectionContainer);

        this.addSectionContainer = createElementFromSelector(`div.row.my-3`);
            this.addSection = CreateQuestions.createIconButton("add", "Add Section", "primary");
        this.addSectionContainer.append(this.addSection);

        this.container.append(this.currentEventDisplay, this.saveAndEventContainer, this.sectionContainerRow, this.addSectionContainer);

        this.importEvent.addEventListener("click", () => {
            this.getQuestions(this.eventInput.value, false).then(this.saveSections.bind(this));
        });
    }
}