const backToPickList = document.querySelector("#back-to-pick-list");
backToPickList.style.zIndex = 100;
let db_firstTime = true;
mainFunctions.Dashboard = async(page) => {
    // const currentYearNode = page.querySelector('#current-year');
    const currentEventNode = page.querySelector('#current-event');
    const currentEventKeyNode = page.querySelector('#current-event-key');
    const nextMatchNode = page.querySelector('#next-match');
    // const currentMatchNode = page.querySelector('#current-match');
    const currentRankNode = page.querySelector('#current-rank');
    const rankingPointGraph = page.querySelector('#ranking-point-graph');
    const finishedMatchesNode = page.querySelector('#finished-matches');
    const upcomingMatchesNode = page.querySelector('#upcoming-matches');
    const dashboardModalBody = page.querySelector("#dashboard-modal-body");
    const dashboardModal = page.querySelector("#dashboard-modal");
    const dashboardModalTitle = page.querySelector("#dashboard-modal-title");

    const { style } = backToPickList;

    const clientRect = page.html.getBoundingClientRect();

    style.top = clientRect.top + 25 + scrollY + "px";
    style.right = 25 + "px";
    // backToPickList.addEventListener("click", () => {
    //     allPages.picklist.load();
    //     backToPickList.classList.add("d-none");
    // });

    const heatmap = new Heatmap();

    // Clone this node in order to use it
    const tbaInfoIcon = createElementFromText(`<i class = "material-icons"> error_outline </i>`)

    // Requires a div around it because material icons have a size of 18x0 which causes the tooltip to be buggy
    const tbaInfoIconSpan = createElementFromText(`
        <span class = "tba-icon text-primary" data-bs-toggle = "tooltip" data-bs-title = "This information is from The Blue Alliance">

        </span>
    `);

    tbaInfoIcon.style.fontSize = "18px";
    tbaInfoIconSpan.appendChild(tbaInfoIcon);

    const matchesNode = page.querySelector('#matches');

    // currentYearNode.innerHTML = selectEvent.value.properties.info.year;
    function populateDashboard() {
        if (!currentEvent) return;
        currentEventNode.innerHTML = currentEvent.info.name;
        currentEventKeyNode.innerHTML = currentEvent.info.key;

        const { matches } = currentEvent;

        // Checking if matches have already been scouted because that would be they have happened
        const upcomingMatches = matches.filter(m => !m.teamsMatchScouting.length);
        const finishedMatches = matches.filter(m => m.teamsMatchScouting.length || isNaN(m.predictedTime));

        upcomingMatches.sort((a, b) => a.matchNumber - b.matchNumber);
        finishedMatches.sort((a, b) => a.matchNumber - b.matchNumber);

        // if (new Date(currentEvent.info.startDate) < Date.now() && Date.now() < new Date(currentEvent.info.endDate)) {
        //     // TODO: write this code 
        //     upcomingMatches.slice().sort((match, previousMatch) => match.predictedTime - previousMatch.predictedTime);
        // } else {
        //     currentMatchNode.innerHTML = "No match going on right now."
        // }

        function getAllianceMemberElement(match, alliance, number) {
            const team = match.alliances[alliance].teamKeys[number].slice(3);
            const element = createElementFromText(`
                <button type="button" class="btn">${team}</button>
            `);
            element.classList.add("text-light");
            if (team == 2122) {
                element.classList.add("fw-bold");
            }
            // if (match.winningAlliance == alliance) element.classList.add("text-decoration-underline");
            if (alliance == "red") {
                // if (!match.teamsMatchScouting || !match.teamsMatchScouting[team]) element.classList.add("btn-maroon");
                /*else*/
                element.classList.add("btn-danger");
            } else {
                // if (!match.teamsMatchScouting || !match.teamsMatchScouting[team]) element.classList.add("btn-navy");
                /*else*/
                element.classList.add("btn-primary");
            }

            element.addEventListener("click", (event) => {
                dashboardModalTitle.innerHTML = "Match Scouting for Team: " + team + " and Match " + match.compLevel + "-" + match.matchNumber;
                dashboardModalBody.innerHTML = "";

                const canvas = document.createElement("canvas");
                dashboardModalBody.appendChild(canvas);

                const { teamsMatchScoutingObj } = match;
                if (!Object.keys(teamsMatchScoutingObj).length) {
                    dashboardModalBody.innerHTML = "<p class ='text-danger'> Could not find match scouting info for this team </canvas>";
                    $("#dashboard-modal").modal("show");
                    return;
                }
                const matchScouting = match.teamsMatchScoutingObj[team];
                if (matchScouting) {
                    const matchCard = new db_MatchCard(matchScouting);
                    dashboardModalBody.appendChild(matchCard.card);
                } else {
                    dashboardModalBody.innerHTML = "<p class ='text-danger'> Could not find match scouting info for this team </canvas>";
                }

                $("#dashboard-modal").modal("show");
            });
            return element;
        }

        function appendTbaInfoToText(text) {
            const div = createElementFromText(`<span> ${text} </span>`);
            div.appendChild(tbaInfoIconSpan.cloneNode(true));
            return div;
        }

        class Header {
            constructor (title, getData) {
                this.title = title;
                this.getData = getData;
            }
        }

        class AllianceHeader extends Header {
            constructor (color) {
                super ();
                this.title = appendTbaInfoToText(`${color} Alliance`);
                this.lowerCaseColor = color.toLowerCase();

                this.getData = (row) => {
                    this.teamDiv = createElementFromSelector("div.btn-group.w-100");
                    this.teamDiv.id = `db--match-row-${row.compLevel}-${row.matchNumber}-${this.lowerCaseColor}`;

                    // Makes it so that when you href to here it will scroll above the element.
                    const { style } = this.teamDiv;

                    // 89 is the tallest the row will get while on a reasonable screen width
                    // style.scrollMarginTop = "89px"; 
    
                    [,,,].fill().forEach((_, i) => {
                        this.appendButtonToTeamDiv(row, i);
                    });
    
                    return this.teamDiv;
                }
            }

            appendButtonToTeamDiv (row, i) {
                this.teamDiv.appendChild(getAllianceMemberElement(row, this.lowerCaseColor, i));
            }
        }

        class PointsHeader extends Header {
            constructor (color) {
                super();
                this.lowerCaseColor = color.toLowerCase();
                this.title = appendTbaInfoToText(`${color} Points`);
                this.getData = (row) => {
                    const { scoreBreakdown: { [ this.lowerCaseColor ]: alliance } } = row;
                    if (!alliance) return 0;
                    const points = createElementFromText(`<p> ${alliance.totalPoints} </p>`);
                    if (row.winningAlliance == this.lowerCaseColor) points.classList.add("fw-bold");
                    return points;
                };
                this.listeners = [{
                    type: "click",
                    action: ((row) => {
                        dashboardModalTitle.innerHTML = "Score Breakdown ";
                        dashboardModalTitle.appendChild(tbaInfoIconSpan.cloneNode(true));


                        dashboardModalBody.innerHTML = "";
                        const scoreBreakdown = row.data.scoreBreakdown[this.lowerCaseColor];
                        Object.keys(scoreBreakdown).forEach(key => {
                            // TODO: Use ReGex to remove camel case
                            dashboardModalBody.appendChild(createElementFromText(`
                                <p>${key}: ${scoreBreakdown[key]}</p>
                            `));
                        });

                        $("#dashboard-modal").modal("show");
                        $(".tba-icon").tooltip();
                    }).bind(this),
                }];
            }
        }

        const tableHeaders = [{
                title: appendTbaInfoToText("Time"),
                getData: (row) => {
                    const date = new Date(row.predictedTime * 1000);
                    if (date == "Invalid Date") return "";

                    return date.toLocaleTimeString() + " " + date.toLocaleDateString();
                }
            },
            {
                title: appendTbaInfoToText("Comp Level - Match Num"),
                getData: (row) => row.compLevel + "-" + row.matchNumber
            },
            new AllianceHeader("Red"),
            new AllianceHeader("Blue"),
            new PointsHeader("Red"),
            new PointsHeader("Blue"),
        ];

        setTable(upcomingMatchesNode, tableHeaders, upcomingMatches);
        // tableHeaders.push({
        //     title: "Winning Alliance",
        //     getData: (row) => row.winningAlliance
        // })
        setTable(finishedMatchesNode, tableHeaders, finishedMatches);

        const previousMatch = finishedMatches[finishedMatches.length - 1];
        const nextMatch = upcomingMatches[0];

        const getMatchInfoAndDate = match => {
            if (!match) return ``;
            const { matchNumber, compLevel, predictedTime } = match;
            return `${compLevel} - ${matchNumber} - (${new Date (predictedTime * 1000).toLocaleTimeString()})`;
        };

        // TODO: use projected time calculator to do this
        nextMatchNode.innerHTML = "";

        // This has to be after set table because it has a query selector that checks if a tr exists
        const previousMatchNode = createElementFromText(`<button class="btn btn-sm btn-primary">Previous Match: ${getMatchInfoAndDate(previousMatch)}</button>`);
        db_MatchCard.addScrollLink(nextMatchNode, previousMatchNode, previousMatch);

        // nextMatchNode.appendChild(previousMatchNode);
        nextMatchNode.appendChild(createElementFromText(`<p>Next Match: ${getMatchInfoAndDate(nextMatch)}</p>`));

        // Creating new tooltips
        $(document).ready(() => {
            $(".tba-icon").tooltip();
        });
    }

    if (db_firstTime) {
        socket.on("new-match", populateDashboard);
    }

    selectEvent.on('change', populateDashboard);

    populateDashboard();

    createRobotDisplay(page, db_firstTime);

    db_firstTime = false;

    return async ({ page }) => "";
    // return async({ page }) => {
    //     selectEvent.off('change');
    // }
}

document.addEventListener('DOMContentLoaded', async() => {});