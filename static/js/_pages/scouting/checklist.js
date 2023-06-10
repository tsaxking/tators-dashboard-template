mainFunctions['Scouting Checklist'] = async() => {
    const pitScoutingList = document.querySelector('#ccl--pit-scouting');
    const setPitScouting = () => {
        pitScoutingList.innerHTML = '';
        currentEvent.teams.filter(t => {
            return t.number !== 2122 && (
                !t.tatorInfo.pitScouting.hasData ||
                // !t.tatorInfo.preScouting.hasData ||
                !t.tatorInfo.electricalScouting.hasData ||
                !t.tatorInfo.mechanicalScouting.hasData ||
                !t.picture
            );
        }).forEach(t => {
            const li = document.createElement("li");
            li.classList.add("collection-item");
            li.innerHTML = `<strong>${t.number} | ${t.info.nickname}</strong>`;

            const ul = document.createElement("ul");

            /**
             * Generates a list item to display that a certain type of scouting wasn't done for a robot
             * @param {string} text The text displayed inside the list item, ex. "Pit Scouting" 
             * @param {string} color A bootstrap color or bootstrap colors extended color that will be the color of the text
             * @param {string} tab The name of the tab inside Scouting that this list item should take you to when you click on it
             * this is separate from text because pictures are on the pit scouting page
             */
            const createLi = (text, color, tab) => {
                const colorObj = Color.fromBootstrap(color);
                
                // Since this generates the original color and then the inverse we have to deconstruct that array
                // const [ _, inverse ] = colorObj.compliment(2);

                // Getting the bootstrap color that is closest to the inverse
                // const { closestBootstrap } = inverse;

                const li = document.createElement("li");
                const button = createElementFromText(`
                    <button class = "btn  btn-sm btn-${color}">
                        <span class="text">${text}</span>
                    </button>
                `);

                button.addEventListener("click", _ => {
                    const { scouting } = allPages;
                    const { query } = scouting;
                    // making it select the correct tab on the scouting page instead of just sending you to pitScouting
                    query.set('tab', tab);
                    // auto selecting the team number. The +[] is there to convert it to a string
                    query.set('team', t.number + []);
                    // Saving the event because otherwise when they reload it can redirect them to an event
                    // That this team isn't event participating in
                    query.set("eventKey", currentEvent.info.key);
                    // Loading the scouting page
                    scouting.load();
                });

                li.append(button);
                ul.appendChild(li);
            };

            if (!t.tatorInfo.pitScouting.hasData) {
                createLi("Pit Scouting", "primary", "pitScouting")
            }
            // if (!t.tatorInfo.preScouting.hasData) {
            //     const li = document.createElement("li");
            //     li.innerText = '<span class="text-danger">Pre Scouting</span>';
            //     ul.appendChild(li);
            // }

            if (!t.tatorInfo.electricalScouting.hasData) {
                createLi("Electrical Scouting", "maroon", "electricalScouting");
            }
            if (!t.tatorInfo.mechanicalScouting.hasData) {
                createLi("Mechanical Scouting", "orange", "mechanicalScouting");
            }
            if (!t.tatorInfo.picture) {
                createLi("Picture", "success", "pitScouting");
            }
            li.appendChild(ul);

            pitScoutingList.appendChild(li);
        });
    };
    setPitScouting();

    const matchScoutingList = document.querySelector('#ccl--match-scouting');
    const setMatchScouting = () => {
        matchScoutingList.innerHTML = '';

        const {matches} = currentEvent;
        matches.sort((a, b) => {
            const order = ['qm', 'qf', 'sf', 'f'];
            const aOrder = order.indexOf(a.compLevel);
            const bOrder = order.indexOf(b.compLevel);

            if (aOrder === bOrder) {
                return a.matchNumber - b.matchNumber;
            }
            return aOrder - bOrder;
        });

        currentEvent.matches.filter(m => {
            return m.teamsMatchScouting.length < 6;
        }).forEach(m => {
            const li = document.createElement("li");
            li.classList.add('collection-item', 'text-light');
            const p = document.createElement("p");
            p.innerText = m.compLevel + ' ' + m.matchNumber;
            const ul = document.createElement("ul");
            m.teams.forEach(t => {
                if (m.teamsMatchScoutingObj[t.number]) return;
                const li = document.createElement("li");
                li.innerText = t.number + ' | ' + t.info.nickname;
                ul.appendChild(li);
            });
            p.appendChild(ul);
            li.appendChild(p);
            matchScoutingList.appendChild(li);
        });
    };
    setMatchScouting();



    const picturesList = document.querySelector('#ccl--pictures');
    const setPictures = () => {
        picturesList.innerHTML = '';
        currentEvent.teams.filter(t => {
            return !t.picture;
        }).forEach(t => {
            const li = document.createElement("li");
            li.classList.add("collection-item", 'text-light');
            li.innerHTML = t.number + ' | ' + t.info.nickname;
            picturesList.appendChild(li);
        });
    };
    // setPictures();

        // updating the list when someone submits a new answer
        if (cl_firstTime) {
            socket.on("new-answer", ({ 
                type, 
                answer, 
                teamNumber,
                eventKey 
            }) => {
                // Checking that the scouting is for the same event
                if (eventKey != currentEvent.info.key) return;
            
                // Checking that the scouting data is event displayed on this page
                if (![
                    "pitScouting",
                    "electricalScouting",
                    "mechanicalScouting",
                ].includes(type)) return;
    
                // Note that the pitScouting is updated in first-info separately from this
                // That means that I can just re-rended and instead of making changes
                setPitScouting();
            });
    
            socket.on("new-picture", ({ eventKey }) => {
                // Checking if the image was uploaded for a different event because then it will be requested later
                if (eventKey != currentEvent.info.key) return;
    
                // Note that the pictures are updated in first-info separately from this
                // That means that I can just re-rended and instead of making changes
                setPitScouting();
            });

            newMatchListeners.push(_ => {
                setMatchScouting();
            });
        }

    cl_firstTime = false;

    return async() => {};
};

let cl_firstTime = true;