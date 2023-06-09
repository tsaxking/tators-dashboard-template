class ScoutingPage {
    /**
     * Creates a page with tabs that each build their own html
     * @param {(AnswerQuestions || CreateQuestions)[]} tabs An array of all of the objects that will be built within each tab
     */
    constructor (tabs, pageName) {
        this.tabs = tabs;

        // Creating an array that will store how up to date all the tab's info is
        this.tabs.forEach(tab => tab.updated = {});

        /**
         * Checks whether the page is open so that it knowns whether or not to populate anything on the page
         * @type {boolean}
         */
        this.open = false;

        /**
         * Checks whether the page has already been built so it won't rebuild it
         * @type {boolean}
         */
        this.built = false;

        /**
         * Which tab this page is selecting 
         * Defaults to the first tab
         * @type {{ build: function }}
         */
        this.selectedTab = this.tabs[0];
        
        /**
         * Which event this has data on
         * Used to figure out whether someone is just loading the page again or if the event actually change
         * @type {string}
         */
        this.event;

        /**
         * Which year this has data on
         * Used to figure out when we need to recalculate year changes
         * @type {number}
         */
        this.year 

        this.name = pageName;
        mainFunctions[pageName] = (...args) => {
            this.build(...args);
        }
    }

    /**
     * The code triggered when the user leaves the page
     */
    onLeave () {
        this.open = false;
    }

    /**
     * Updates a tab so that it has the info for the current event,
     * Marks that tab as updated so that it won't update again
     * @param {{onEventChange: function}} tab Some class that has an onEventChange property
     * @returns {Void}
     */
    async updateEvent (tab) {
        const { updated } = tab;
        // Checking if the tab already has info for the current event
        if (updated.event) return;

        // Updating the tab
        await tab.onEventChange();
        // Marking the tab as updated
        // This will be set to false when the event changes
        updated.event = true;
    }

    /**
     * Updates a tab so that it has the info for the current year,
     * Marks that tab as updated so that it won't update again
     * @param {{onYearChange: function}} tab Some class that has an onYearChange property
     * @returns {Void}
     */
    updateYear(tab) {
        const { updated } = tab;
        // Checking if the tab already has info for the current event
        if (updated.year) return;

        // Updating the tab
        tab.onYearChange();
        // Marking the tab as updated
        // This will be set to false when the event changes
        updated.year = true;
    }

    /**
     * Selects a tab and updates it's info
     * @param {Object} tab Some tab with an update event and update year method 
     */
    async selectTab(tab) {
        this.selectedTab = tab;
        // Updates the tab when it is selected
        if (this.name == "Create Scouting Questions") this.updateYear(this.selectedTab);
        await this.updateEvent(this.selectedTab);
    }

    /**
     * Builds the page and all of the elements in it
     * Triggered on event change and on page load
     */
    async build () {
        this.container = currentPage.body;
        // Checking if this page already has all of it's html so it won't rebuild it
        if (!this.built) {
            this.nav = createElementFromText(`<ul class="nav nav-tabs" id="match-nav" role="tablist"></ul>`);
            this.tabContent = createElementFromText(`
                <div class="tab-content">
            `);

            this.navTabs = {};
            this.tabs.forEach((tab, i) => {
                const { name } = tab;
                const tabElements = {};

                // Generating a number that is completely unique
                const prefix = name + Date.now();
                tabElements.button = createElementFromText(`
                    <button class="nav-link ${i ? "": " active"}" id="${prefix}NavTab" data-bs-toggle="tab" data-bs-target="#${prefix}TabPanel" type="button" role="tab" aria-controls="#${name}TabPanel" aria-selected="true">${camelCaseToNormalCasing(name)}</button>
                `);
                tabElements.listItem = createElementFromText(`
                    <li class="nav-item" role="presentation"></li>
                `);

                // Updates which tab is selected when you select the tab
                // Lets us only update the tabs you are accessing
                tabElements.button.addEventListener("click", async _ => {
                    await this.selectTab(this.tabs[i]);
                });
                tabElements.listItem.append(tabElements.button);

                this.navTabs[name] = tabElements;
                
                this.nav.append(tabElements.listItem);

                const tabPane = createElementFromText(`
                    <div class="tab-pane fade px-3${i ? "": " active show"}" id="${prefix}TabPanel" role="tabpanel" data-bs-toggle="tab" aria-labelledby="#${name}NavTab">
                `);

                // Adding all of the tab's contents to the tab pane
                tab.build(tabPane);
                this.tabContent.append(tabPane);
            });

            this.container.append(this.nav, this.tabContent);
            this.built = true;
        }

        const { query } = currentPage;
        
        const tab = query.get("tab");

        if (tab) {
            const navTab = this.navTabs[tab];
            const tabObject = this.tabs.find(t => t.name == tab);

            await this.selectTab(tabObject);
            $(navTab.button).tab("show");
        }

        const { selectedTab, navTabs } = this;

        // Making the tab appear as selected when you exit and re-enter the page
        const { button } = navTabs[selectedTab.name];
        button.classList.add("active");

        // Updating which event and year this page has data on
        const { key, year } = currentEvent.info;

        // This will update the events whenever someone loads the page and the year has changes
        // or when someone changes the year
        if (this.year != year) {
            // Updates which events you can import questions from
            if (this.name == "Create Scouting Questions") {
                await CreateQuestions.onYearChange();

                this.tabs.forEach(tab => {
                    tab.updated.year = false;
                });

                this.updateYear(this.selectedTab);
            };
        }
        
        // Checking that the event key actually changed in case someone just left the page and came back
        if (key != this.event) {
            // Marking all of the tabs as not updated so that when a tab
            // is loaded we know that we need to update it
            this.tabs.forEach(tab => {
                tab.updated.event = false;
            });

            await this.updateEvent(this.selectedTab);
        }

        const team = query.get("team") || query.get("robot");

        const { teamInput } = this.selectedTab;
        const { currentRobots } = this.selectedTab;
        if (team && teamInput && currentRobots.find(r => r.number == team)) {
            teamInput.value = team;
            this.selectedTab.onRobotChange();
        }

        // Updating which event we have info on
        this.event = key;
        this.year = year;

        this.open = true;
        
        return this.onLeave.bind(this);
    }
}

