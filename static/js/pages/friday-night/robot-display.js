// PRIORITY_2
let db_teamSelect, db_populatePage;

async function createRobotDisplay (page, firstTime) {
    if (firstTime) {
        db_populatePage = async () => {
            const { value: teamNumber } = db_teamSelect;
        
            //updates db_currentRobot with current team
            db_currentRobot = currentEvent.teams.find(t => t.number == (+teamNumber));
            if (!db_currentRobot) return;

            //call barchart function & get match data
            const matches = createScoringBarchart();
        
            db_currentHeatmap = db_currentRobot.tatorInfo.heatmap;
            // db_currentHeatmap = await requestFromServer({
            //     url: '/robot-display/heatmap',
            //     method: 'POST',
            //     body: {
            //         teamNumber,
            //         eventKey: currentEvent.info.key
            //     },
            //     cached: true
            // });
        
            // db_autoCheckbox.checked = true;
            // db_teleopCheckbox.checked = true;
            // db_endgameCheckbox.checked = true;
        
            //call pitscout function
            getPitScoutInfo(+teamNumber, currentEvent.info.key);
        
            //creates message if no pitscout info
            try { getPitScoutInfo(+teamNumber, currentEvent.info.key); } catch {
                const container = document.querySelector("#db--pit-scout-table");
                container.innerHTML = `
                <div class="row">
                    <div class="col-12">
                        <p class="fw-bold text-center">There is no pit scouting data</p>
                    </div>
                </div>
                `
            }
        
            //call heatmap functions
            TimeSegmentSelect.loadHeatmapForTeam();
            
            //adds team's matches to db_current robot
            // db_currentRobot.matches = matches;
        
            //match select
            //adds each match
            matches.forEach(m => {
                const option = document.createElement('option');
                option.innerText = m.matchNumber;
                option.value = m.matchNumber;
                // db_matchSelect.appendChild(option);
            });
        
            db_loadMatchCards();
        
            db_getPicture(teamNumber);
        
            db_populateGridHeatmap();
        
            db_scoutingCards.forEach(scoutingCard => scoutingCard.populate());
        
            db_commentDisplayList.populate([], db_currentRobot.matchScouting);
            socket.emit("get comments", { teamNumber, eventKey: currentEvent.info.key });

            populateOtherData();
        
            if (fetchRankInterval) clearInterval(fetchRankInterval);
            fetchRank();
            // Fetches the rank again every 10 minutes
            fetchRankInterval = setInterval(fetchRank, 1000 * 60 * 10);
        }

        db_teamSelect = document.querySelector('#db--team-select');

        const getRobot = (teamNumber, year) => {
            // requestFromServer({
            //     url: '/robot-display/get-robot',
            //     method: 'POST',
            //     body: {
            //         teamNumber,
            //         year
            //     },
            //     func: (data) => console.log(data)
            // });
            return currentEvent.teams.find(t => t.number == teamNumber);
        }
        
        // Match Data Stuff
        const db_matchCardContainer = document.getElementById("db--match-card-container");
        
        // Code I copy pasted from stack overflow
        const attachDragger = (selector) => {
            let attachment = false, lastPosition, speed, momentumInterval;
            $( selector ).on("mousedown mouseup mousemove", function (e) {
                const { clientX } = e;
                switch (e.type) {
                    case "mousedown":
                        if (momentumInterval) clearInterval(momentumInterval);
                        speed = 0;
                        attachment = true, lastPosition = clientX;
                        break;
                    case "mouseup": 
                        momentumInterval = setInterval(_ => {
                            speed *= 31/32;

                            // Clearing the interval if you are no longer moving
                            if (Math.abs(speed) <= 1) clearInterval(momentumInterval);

                            $(this).scrollLeft($(this).scrollLeft() - speed);
                        });

                        attachment = false;
                        break;
                    case "mousemove":
                        if (attachment) {
                            const difference = clientX - lastPosition;
                            speed = difference;
        
                            $(this).scrollLeft($(this).scrollLeft() - difference);
                            lastPosition = clientX;
                        }
                }
            });
        
            $(window).on("mouseup", function() {
                attachment = false;
            });
        };
        
        $(document).ready(_ => {
            attachDragger("#db--match-card-container");
        });

        const db_timesSegmentSelects = document.querySelector("#db--times-segment-selects");
        db_MatchCard.segments.forEach(segment => {
            const { name, color } = segment;

            new TimeSegmentSelect(name, color, db_timesSegmentSelects);
        });

        // document.getElementById("db--collapse-2").addEventListener("show.bs.collapse", () => {
        //     db_loadMatchCards();
        // });
        
        // Called when you open up the accordion or change the selected robot
        const db_loadMatchCards = () => {
            db_matchCardContainer.innerHTML = "";
            //db_matchTraceCanvas.getContext("2d").clearRect(0, 0, db_matchTraceCanvas.width, db_matchTraceCanvas.height)
            //checks for current robot
            if (!db_currentRobot) {
                return;
            }
            const { matches } = db_currentRobot.matchScouting;
        
            //checks if the robot has played in any matches
            if (!matches.length) {
                db_matchCardContainer.appendChild(createElementFromText("<p class='text-center text-danger'>This robot has not been in any matches yet.</p>"));
                return;
            }
            //filters out unique matches
            let { unique: uniqueMatches } = db_currentRobot.matchScouting;
        
            // Reversing the matches since the most recent ones are the most relavent
            uniqueMatches = uniqueMatches.reverse();
        
            
            //creates a match card for each unique match
            TimeSegmentSelect.matchCards = uniqueMatches.map(match => {
                const matchCard = new db_MatchCard(match);
                db_matchCardContainer.appendChild(matchCard.col);

                return matchCard;
            });
        }

        const efficientResize = fn => {
            let timeoutID;
            return e => {
                // This causes the resize listener to cancel if you resize a second time so that it will only run once
                if (timeoutID) clearTimeout(timeoutID);
                timeoutID = setTimeout(_ => fn(e), 250);
            }
        }
        
        class db_Barchart {
            constructor (name, headers, container , { max }) {
                this.name = name;
                this.headers = headers;
                this.options = { max };
                this.container = container;
                this.graph;
        
                this.createChart();
                this.resizeListener = _ => {};
        
                window.addEventListener("resize", _ => this.resizeListener());
            }
        
            createChart () {
                const { height } = this.container.getBoundingClientRect();
        
                this.col = createElementFromText(`<div class = "col-12 px-2"></div>`);
                    const { width } = this.col.getBoundingClientRect();
                    this.card = createElementFromText(`<div class="card"></div>`);
        
                        this.cardHeader = createElementFromText(`
                            <div class="card-header">
                                <h6 class="card-title no-select"> ${camelCaseToNormalCasing(this.name)} </h6>
                            </div>
                        `);
                    this.card.appendChild(this.cardHeader);
        
                        this.cardBody = createElementFromText(`<div class="card-body"></div>`);
                        // this.cardBody.style.width = Math.max(width, 300) + "px";
                        const cardHeight = Math.max(height, 350)
                        this.cardBody.style.height = cardHeight + "px";
                            this.canvas = createElementFromText(`<canvas class="w-100" width = "${width}" height = ${cardHeight}></canvas>`);
                            this.ctx = this.canvas.getContext('2d');
        
        
                        this.cardBody.appendChild(this.canvas);
                    this.card.appendChild(this.cardBody);
                
                this.col.appendChild(this.card);
                this.container.appendChild(this.col);
            }
        
            render(data, labels) {
                // Clears the previous chart so chart.js doesn't get angry at you
                if (this.graph) this.graph.destroy();
        
                // Creating an array of colors for the graph to cycle through
                const color = Color.fromHSL(0, 0.65, 0.65);
                const gradient = color.compliment(this.headers.length);
        
                const chartInfo = {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: this.headers.map((c, i) => {
                            const { label } = c;
        
                            // Creates a new dataset
                            return { 
                                // Label from match labels
                                label,
                                // An array derived from performing the getData functions of each collect object on every match of the robot you are gathering information on
                                data: data.map(m => c.getData(m)),
                                // Setting the color and using modulo so it will cycle
                                backgroundColor: gradient[i].toString("rgba"),
                            }
                        }),
                    },
                    options: {
                        // maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: camelCaseToNormalCasing(this.name),
                            },
                        },
                        responsive: true,
                        scales: {
                            x: {
                                stacked: true
                            },
                            y: {
                                stacked: true,
                                min: 0,
                                display: true,
                                max: this.options.max || 70,
                            }
                        }
                    },
                };

                // makes a new chart
                this.graph = new Chart(this.ctx, chartInfo);
        
                this.resizeListener = _ => {
                    this.render(data, labels);
                };
            }
        }
        
        // const rd_barChartScoring = document.querySelector("#rd--bar-chart-scoring");
        // rd_barChartScoring.addEventListener("change", async () => {
        //     const { matches, graph } = await createScoringBarchart(db_currentRobot.number, currentEvent.info.key, db_robotPointsGraph, document.getElementById('db--bar-chart'));
        //     db_robotPointsGraph = graph;
        
        // })
        
        //request robot points graph data
        const db_barchartContainerId = "#db--barchart-container";
        let db_barchartContainer = document.querySelector(db_barchartContainerId);
        attachDragger(db_barchartContainerId);
        
        // Importing all of the scoring functions for this year
        const { getGridScoreTimeSegments, getBalanceScoreMultiple, calculateLinks, getAutoMobility, getParked, traceAmount } = FIRSTYear[2023];
        const getBalanceScoreCalculator = (timeSegments) => getBalanceScoreMultiple(timeSegments)(["level", "tipped"])(true)
        
        // this are all multidimensional but they are flattened later
        const collect2023 = [
            { label: "Auto Balance", getData: match => {
                return getBalanceScoreCalculator(["auto"])(match);
            }, },
            { label: "Endgame Balance", getData: match => {
                if (match.tbaMatch) return match.tbaBalanceScore("endgame");
                return getBalanceScoreCalculator(["teleop", "endgame"])(match);
            }, },
            
            { label: "Auto Place", getData: getGridScoreTimeSegments(["auto"])(true) },
            { label: "Teleop/Endgame Place", getData: getGridScoreTimeSegments(["teleop", "endgame"])(true) },
        
            // calculateLinks, getAutoMobility, and getParked all return functions that calculate links, get mobility etc.
            // { label: "Links", getData: calculateLinks(true) },
            // { label: "Auto Mobility", getData: getAutoMobility(true) },
            // { label: "Parked", getData: getParked(true) },
            { label: "Links, Mobility, and Parking", getData: match => calculateLinks(true)(match) + getAutoMobility(true)(match) + getParked(true)(match) }
        ].flat(Infinity);
        
        // Adding picking to only the non-score since picking doesn't actually contribute to your score
        const collectPicking2023 = ["pickCone", "pickKnockedCone", "pickCube", "pickLoadingCone", "pickLoadingCube"].map(type => {
            return { 
                // Normal casing converts pickCone into Pick Cone
                label: camelCaseToNormalCasing(type), 
                // Trace amount takes in time then type of action but if you leave it blank it just collects for the entire match
                getData: traceAmount()(type) 
            };
        });
        
        
        const db_scoringBarChart = new db_Barchart("Scoring Bar Chart", collect2023, db_barchartContainer, { max: currentEvent.highestScore });
        const db_amountBarChart = new db_Barchart("Picking Bar Chart", collectPicking2023, db_barchartContainer, { max: 20 });
        
        const db_barCharts = [
            db_scoringBarChart, db_amountBarChart,
        ];
        
        const updateHighScore =  _ => {
            // Updating the bar chart's max based off the new event's high score
            db_scoringBarChart.options.max = currentEvent.highestScore;
        }

        selectEvent.on("change", updateHighScore);

        const createScoringBarchart = _ => {
            // Getting match scouting
            const { matches } = db_currentRobot ? db_currentRobot.matchScouting : { matches: [] };
            // An array used as the labels for chart js
            const matchNumberLabels = [];
        
            // const collect = {
            //     2023: collect2023,
            // // TODO: change this to currentYearObj.number since the 2023 was just for testing
            // }[2023].flat(Infinity);
        
            // sorts the matches and then add them to match numbers which is an array for chart js labels
            matches.sort((a, b) => a.matchNumber - b.matchNumber).forEach(match => {
                matchNumberLabels.push(match.compLevel + ' ' + match.matchNumber);
            });
        
            db_barCharts.forEach(barChart => {
                barChart.render(matches, matchNumberLabels);
            });
        
            return matches;
        }
        
        const db_gridHeatmapContainer = document.querySelector("#db--grid-heatmap-container");
        const db_gridHeatmapCanvas = document.querySelector("#db--grid-heatmap-canvas");
        
        function db_populateGridHeatmap() {
            GridHeatmapRectangle.resizeGridHeatmap(db_gridHeatmapCanvas, db_gridHeatmapContainer);
            db_gridHeatmapImage.draw(db_gridHeatmapCanvasClass);
            if (!db_currentRobot) return;
            const { matches } = db_currentRobot.matchScouting;
            if (!matches.length) return;
            const rects = GridHeatmapRectangle.getRects(9, 3, matches.length, [new Color(0, 0, 255, 0.25), new Color(0, 255, 0, 1)]);
            rects.forEach(rect => {
                rect.setAmount(matches);
                rect.draw(db_gridHeatmapCanvasClass);
            });
        }
        
        // Resizes and then redraws everything
        addEventListener("resize", efficientResize(db_populateGridHeatmap));
        
        const db_gridHeatmapCanvasClass = new Canvas(db_gridHeatmapCanvas);
        const db_gridHeatmapImage = new CanvasImage(`../static/pictures/2023/grid.jpg`);
        await db_gridHeatmapImage.render();

        const onEventChange = _ => {
            db_teamSelect.innerHTML = '<option> Select a Robot </option>';
        
            //sort teams
            currentEvent.teams = currentEvent.teams.sort((a, b) => +a.number - +b.number);
        
            //add teams to the team select
            currentEvent.teams.forEach(t => {
                const option = document.createElement('option');
                option.innerText = t.number + ' | ' + t.info.nickname;
                option.value = t.number;
                db_teamSelect.appendChild(option);
            });
        }

        selectEvent.on('change', onEventChange);
        
        let db_currentRobot, db_currentHeatmap;
        
        let fetchRankInterval;
        const fetchRank = async _ => {
            if (!db_currentRobot) return;
        
            const currentRankNode = allPages.dashboard.html.querySelector('#current-rank');
        
            try {
                // It's ok to request this since it is a dynamic thing rather than static info
                const status = await requestFromServer({
                    url: '/events/get-team-status',
                    method: 'POST',
                    body: {
                        teamNumber: db_currentRobot.number,
                        eventKey: currentEvent.info.key,
                    }
                });
        
                const { rank } = status.qual.ranking;
        
                currentRankNode.innerHTML = `${db_currentRobot.number}'s Current Rank: ${rank}`;
            } catch (e) {
                currentRankNode.innerHTML = "Robot Info Not Found";
            }
        
        }
        
        
        //actually selects the team
        // const db_matchSelect = document.querySelector('#db--match-select')
        db_teamSelect.addEventListener('change', db_populatePage);
        
        // document.getElementById("db--collapse-1").addEventListener("show.bs.collapse", () => {
        //     db_loadHeatmapForTeam();
        // });
        
        const createImage = src => {
            if (!src) return;
            const img = new Image();
            img.classList.add("img-thumbnail");
            img.src = src;
            return img;
        }

        const carouselHeight = 200;

        const createCarouselItem = async el => {
            const carouselItem = createElementFromText(`<div class="carousel-item"></div>`);
            carouselItem.appendChild(el);

            const promise = new Promise((res, rej) => {
                el.addEventListener("error", _ => {
                    carouselItem.remove();
                    res(false)
                });

                el.addEventListener("load", _ => {
                    const { style, width, height } = el;

                    const scaleFactor = width/height;
                    style.height = carouselHeight + "px";
                    style.width = scaleFactor * carouselHeight + "px";

                    res(carouselItem);
                });
            })
            
            return await promise;
        }

        const imgContainer = document.querySelector('#db--team-pictures');
        imgContainer.style.height = carouselHeight + "px";

        const previousButton = createElementFromText(`
            <button class="carousel-control-prev" type="button" data-bs-target="#db--team-pictures" data-bs-slide="prev">
                <span class="carousel-control-prev-icon"></span>
                <span class="visually-hidden">Previous</span>
            </button>
        `);
        const nextButton = createElementFromText(`
            <button class="carousel-control-next" type="button" data-bs-target="#db--team-pictures" data-bs-slide="next">
                <span class="carousel-control-next-icon"></span>
                <span class="visually-hidden">Next</span>
            </button>
        `);

        const db_getPicture = async() => {
            const { picture } = db_currentRobot.tatorInfo;
            const { media } = db_currentRobot.info;

            imgContainer.innerHTML = ``;    

            const srcImages = media.map(image => {
                const { directUrl, details, type } = image;
                const { base64Image } = details;

                if ([
                    // Not displaying the avatar because it's not really an image of the bot
                    "avatar"
                ].includes(type)) return;


                if (directUrl) {
                    if (type == "instagram-image") {
                        // Just using the blue alliances hosting of the image instead of instagram embeds
                        return `https://www.thebluealliance.com/` + directUrl;
                    }
                    // Not showing youtube thumbnails because it's more useful to link the video
                    if (type == "youtube") return;
                    return directUrl;
                }
                if (base64Image) return `data:image/jpeg;base64, ${base64Image}`;
            }).filter(img => img); // removing undefined values

            const sources = [
                `../uploads/${picture}`,
                ...srcImages
            ];

            // Making all the async things a separate function so that we can run it afterwards and getPicture will still be a normal function
            const doAsyncStuff = async _ => {
                await Promise.all(sources.map(async src => {
                    const item = await createCarouselItem(createImage(src));
                    if (!item) return;
                    imgContainer.appendChild(item);
                }));
    
                const { childNodes } = imgContainer;
                if (!childNodes.length) return;
                childNodes[0].classList.add("active");

                // Not adding arrows if there is 1 image because if it has one image it doesn't really need to be a carousel
                if(childNodes.length == 1) return;
                // media.forEach(image => {
                //     const { viewUrl, directUrl, base64Image, type } = image;
    
                //     // not including the link if there is no image or the image has already been added
                //     if (!viewUrl || (directUrl && !(type == "youtube")) || base64Image) return;
                //     imgContainer.append(createCarouselItem(createElementFromText(`<a target="_blank" href = "${viewUrl}">${type}</a>`)));
                // });
                
                imgContainer.append(previousButton, nextButton);
            }

            doAsyncStuff();
        }

        socket.on("new-picture", ({ teamNumber, eventKey }) => {
            // Note that the picture refreshes when they select a new bot so we only need to update it if the bot is currently selected

            // Checking if this is even the same event because they can't select a team that isn't even in the event
            if (eventKey != currentEvent.info.key) return;
            // Checking if they have a team selected
            if (!db_currentRobot) return;

            const { number } = db_currentRobot;

            // checking that the team is selected
            if (number != teamNumber) return;

            // updating the image
            db_getPicture(number);
        });
        
        
        function db_makeTrace(matchNum, traceCanvas, startTime, endTime) {
            //initializes start and end times if they exist
            startTime = startTime ? startTime : 0;
            endTime = endTime ? endTime : 150;
        
            const currentMatch = db_currentRobot.matches.find(m => m.matchNumber == (+matchNum))
            trace = JSON.parse(currentMatch.trace).map(line => {
                if (Array.isArray(line)) {
                    return line.map(position => {
                        // creates new db_TracePosition (class in canvas-classes.js) and scales position x and y to canvas
                        return new db_TracePosition(position[0] * traceCanvas.offsetWidth, position[1] * traceCanvas.offsetHeight, position[2]);
                    });
                } else {
                    //creates new db_TraceAction and scales position x and y to canvas 
                    return [new db_TraceAction(line.p[0] * traceCanvas.offsetWidth, line.p[1] * traceCanvas.offsetHeight, line.time, line.action)];
                }
            });
        
            //scales canvas dimensions
            //const traceCanvas = document.getElementById("db--tracemap");
            traceCanvas.style.height = traceCanvas.offsetWidth / 2 + 'px';
            traceCanvas.width = traceCanvas.offsetWidth;
            traceCanvas.height = traceCanvas.offsetHeight;
        
            const ctx = traceCanvas.getContext('2d');
        
            ctx.beginPath();
            ctx.lineWidth = 2.5;
        
            //draws the line
            trace.forEach((line, lineIndex) => {
                line.forEach((c, i) => {
                    if (startTime <= c.time && c.time <= endTime) {
                        let last = line[i - 1];
                        if (!last) {
                            const lastList = trace[lineIndex - 1]
                            if (!lastList) {
                                return;
                            }
                            last = lastList[lastList.length - 1];
                            if (!last) {
                                return;
                            }
                            // ctx.moveTo(c.x, c.y);
                        }
                        c.plotLine(traceCanvas, last);
                    }
                });
            });
        }
        
        /* 
            `_____                                     _   _                               _   __  __       _       _       _____        _        
            |  __ \                                   | | (_)                             | | |  \/  |     | |     | |     |  __ \      | |       
            | |__) | __ ___        ___  ___ ___  _   _| |_ _ _ __   __ _    __ _ _ __   __| | | \  / | __ _| |_ ___| |__   | |  | | __ _| |_ __ _ 
            |  ___/ '__/ _ \      / __|/ __/ _ \| | | | __| | '_ \ / _` |  / _` | '_ \ / _` | | |\/| |/ _` | __/ __| '_ \  | |  | |/ _` | __/ _` |
            | |   | | |  __/      \__ \ (_| (_) | |_| | |_| | | | | (_| | | (_| | | | | (_| | | |  | | (_| | || (__| | | | | |__| | (_| | || (_| |
            |_|   |_|  \___|      |___/\___\___/ \__,_|\__|_|_| |_|\__, |  \__,_|_| |_|\__,_| |_|  |_|\__,_|\__\___|_| |_| |_____/ \__,_|\__\__,_|
        */
        // Pit scouting 
        const getPitScoutInfo = async(teamNumber, eventKey) => {
            const pitScouting = db_currentRobot.tatorInfo.pitScouting.data;
            if (!pitScouting) return;
            //create element for pitscout display
            const container = document.querySelector("#db--pit-scout-table");
            if (Object.keys(pitScouting).length == 0) {
                container.innerHTML = `
                <div class="row">
                    <div class="col-12">
                        <p class="fw-bold text-center text-danger">There is no pit scouting data for this robot</p>
                    </div>
                </div>
                `;
                return;
            }
        
            //clear
            container.innerHTML = '';
        
            //adds a new row to the container for each question
            Object.keys(pitScouting).forEach(q => {
                const row = createPitQA(q, pitScouting[q], {});
                container.appendChild(row);
            });
        }
        
        ["cone", "cube", "hybrid"].forEach(imgName => {
            const img = document.createElement("img");
            img.src = `../static/pictures/2023/${imgName}.svg`;
            img.style.width = img.style.height = "15px";
            window[imgName] = img;
        });
        
        class QuestionsCard {
            /**
             * takes in a string
             * Will return an anchor element if the string is a valid URL
             * will return back the string otherwise
             * @param {string} string A string that might be a URL
             * @returns {HTMLElement || string}
             */
            static URLify (string) {
                try {
                    const link = createElementFromText(`<a href="${string}" target="_blank">${string}</a>`);
                    // Getting where the link will redirect you
                    const { host } = link;
                    // If the link is invalid, it will redirect you back to the same website
                    // so if the link is valid, it's host will not be the same as the website's host
                    const isUrl = host && host != window.location.host;
                    if (isUrl) {
                        return link;
                    }

                    return string;
                } catch (e) {
                    console.error(e);

                    return string;
                }
                
            }

            constructor (type, container, header, answerClass) {
                this.type = type;
                this.container = document.querySelector(container);
                this.header = header;
                this.answerClass = answerClass;
                this.questions;
                this.header = document.querySelector(header);
        
                this.eventChange();
                selectEvent.on("change", this.eventChange.bind(this));
        
                if (header && !firstTime) {
                    this.editButtonContainer = createElementFromSelector(`span.text-right`);
                        this.editButton = createElementFromText(`<button class = "btn btn-primary">Edit <span class = "material-icons">edit</span></button>`);
                    this.editButtonContainer.append(this.editButton);
        
                    this.header.append(this.editButtonContainer);
        
                    this.editButton.addEventListener("click", _ => {
                        if (!db_currentRobot) return;
                        this.answerClass.setMatchInfo({ teamNumber: db_currentRobot.number});
                        this.openPage();
                    });
                }
            }
        
            async eventChange () {
                this.questions = await currentEvent[this.type + "Questions"];
            }
            
        
            clearContainer () {
                this.container.innerHTML = '';
            }
        
            get dataObject () {
                return db_currentRobot.tatorInfo[this.type];
            }
        
            get data () {
                const { data } = this.dataObject;
                
                // if (!pitScouting) return;
        
                // Checking if there is no response, if the response is an array or if the response is an empty object.
                if (!data || !Object.keys(data).length) {
                    this.container.appendChild(createElementFromText(`<p class='text-center text-danger'>This robot has not had any ${camelCaseToNormalCasing(this.type)} yet.</p>`));
                    return;
                }

                return data;
            }
        
            populate () {
                this.clearContainer();
        
                if (!this.data) return;
                this.getQuestionsAnswerPairs(this.data).forEach(question => this.container.appendChild(createPitQA(question.question, question.answer, { preventNormalCase: true })));
            }
        
            getQuestionsAnswerPairs (data) {
                if (!(this.questions && data)) return [];
        
                const questionsAnswerPairs = Object.keys(data).map(k => {
                    try {
                        //initializes question as the keys from the response
                        let question = this.questions.find(q => q.key == k);

                        //adds question to question answer pair
                        const qaPair = {
                            question: question ? question.question : k,
                        };
        
                        if (!question && k != "timestamp" && k != "scoutName") return qaPair;
        
                        //for each key, the corresponding answer is added to the question answer pair
                        switch (k) {
                            // case "matchInfo":
                            //     qaPair.answer = data[k].eventKey + " | " + data[k].matchNumber + " | " + data[k].compLevel;
                            //     break;
                            case "timestamp":
                                qaPair.answer = new Date(data[k]).toLocaleString();
                                break;
                            default:
                                // Written like this because some answers are booleans
                                // return typeof row[k] != "undefined" ? row[k] : "";
                                switch (typeof data[k]) {
                                    case 'undefined':
                                        qaPair.answer = '';
                                        break;
                                    case 'object':
                                        if (question.type == "checkbox") {
                                            let str = ""
                                                //If the question type is checkboxes, the answer is each checked option
                                            Object.keys(data[k]).forEach((option) => {
                                                if (data[k][option]) str = (!str.length) ? option : str + ", " + option;
                                            });
                                            console.log(str);
                                            qaPair.answer = str;
                                            break;
                                        } else {
                                            qaPair.answer = JSON.stringify(data[k]);
                                            break;
                                        }
                                    default:
                                        const value = data[k];
                                        // Will return a hyperlink if the value is a valid URL
                                        // will return the value otherwise
                                        qaPair.answer = QuestionsCard.URLify(value);
                                }
                        }
                        return qaPair;
                    } catch {}
                });
        
                return questionsAnswerPairs;
            }
        
            openPage () {
                const normalCaseType = camelCaseToNormalCasing(this.type);
                const { pathname } = Object.values(allPages).find(page => page.name == normalCaseType);
        
                openPage(pathname);
            }
        
        }
        
        class QuestionsTableCard {
            constructor (type, container, answerClass) {
                this.questionCard = new QuestionsCard(type, container, false, answerClass);
            }
        
            build () {
                this.container.innerHTML = "";
                this.container.classList.add("table-responsive");
                // The table has to have an id because of Taylor's setTable being strange so I just generated a unique id for the table
                this.table = createElementFromText(`<table class="table table-dark table-striped table-hover" id ="${Date.now() + Math.random()}"></table>`);

                this.container.append(this.table);
            }
        
            get container () {
                return this.questionCard.container;
            }
        
            get questions () {
                return this.questionCard.questions;
            }
        
            get type () {
                return this.questionCard.type;
            }

            get data () {
                return this.questionCard.data;
            }
        
            get dataObject () {
                return this.questionCard.dataObject;
            }
        
            async populate () {
                this.build();

                const { questions, data } = this;
                if (!(data && questions)) return;
                
                //makes array of keys of pre scout data
                const keys = this.dataObject.uniqueQuestions;
                    
                //creates headers
                const headers = keys.map(k => {
                    //find the question with corresponding key
                    let question = questions.find(q => q.key == k);
                    if (k == "_rowPos") return;
                    return {
                        //If there is a question, make the title the question, if not make the title the key
                        title: camelCaseToNormalCasing(question ? question.question : k),
                        getData: (row) => {
                            //for each key, return corresponding data
                            switch (k) {
                                case "matchInfo":
                                    if (!row[k]) return "";
                                    const { compLevel, matchNumber, scoutedEvent } = row[k];
                                    const levelAndNumber = compLevel + " | " + matchNumber;
                                    return scoutedEvent ? scoutedEvent + " | " + levelAndNumber : levelAndNumber;
                                case "timestamp":
                                    return new Date(row[k]).toDateString();
                                default:
                                    // Written like this because some answers are booleans
                                    // return typeof row[k] != "undefined" ? row[k] : "";
                                    switch (typeof row[k]) {
                                        case 'undefined':
                                            return '';
                                        case 'object':
                                            console.log(question);
            
                                            //if the question type is checkbox the header becomes the content of the checked options
                                            if (question.type == "checkbox") {
                                                let str = ""
                                                console.log(k)
                                                Object.keys(row[k]).forEach((option) => {
                                                    if (row[k][option]) str = (!str.length) ? option : str + ", " + option;
                                                });
                                                return str;
                                            } else {
                                                return JSON.stringify(row[k]);
                                            }
                                        default:
                                            const value = row[k];
                                            // Will return a hyperlink if the value is a valid URL
                                            // will return the value otherwise
                                            return QuestionsCard.URLify(value);
                                    }
                            }
                        },
                        tooltip: question ? question.description : k
                    }
                });
            
                //creates table with headers created above
                setTable(this.table, headers, data);
            }
        }
        
        // Constant value and variable things
        const db_pitScoutInfoContainer = "#db--pit-scouting-info-container";
        const db_pitScoutHeader = "#db--pit-scouting-header"
        const db_electricalScoutInfoContainer = "#db--electrical-scouting-info-container";
        const db_electricalScoutHeader = "#db--electrical-scouting-header"
        const db_mechanicalScoutingInfoContainer = "#db--mechanical-scouting-info-container";
        const db_mechanicalScoutHeader = "#db--mechanical-scouting-header"
        const db_preScoutingContainer = "#db--pre-scouting-container";
        const db_eliminationMatchScoutingContainer = "#db--elimination-match-scouting-container";

        const db_pitScoutingCard = new QuestionsCard("pitScouting", db_pitScoutInfoContainer, db_pitScoutHeader, ps_answers);
        const db_electricalScoutingCard = new QuestionsCard("electricalScouting", db_electricalScoutInfoContainer, db_electricalScoutHeader, es_answers);
        const db_mechanicalScoutingCard = new QuestionsCard("mechanicalScouting", db_mechanicalScoutingInfoContainer, db_mechanicalScoutHeader, ms_answers);

        const db_preScoutingCard = new QuestionsTableCard("preScouting", db_preScoutingContainer, prs_answers);
        const db_eliminationMatchScoutingCard = new QuestionsTableCard("eliminationMatchScouting", db_eliminationMatchScoutingContainer, ems_answers);

        const db_scoutingCards = [
            db_pitScoutingCard,
            db_electricalScoutingCard,
            db_mechanicalScoutingCard,
            db_preScoutingCard,
            db_eliminationMatchScoutingCard,
        ];
        
        newMatchListeners.push(_ => {
            updateHighScore();
            db_populatePage();
        });
        
        socket.on("new-answer", ({ type, eventKey, teamNumber }) => {
            if (!db_currentRobot) return;

            const events = selectEvent.options.map(option => option.properties);

            // Finding the event which has received scouting
            const event = events.find(e => e.info.key == eventKey);

            // Checking that the event exists
            if (!event) return;

            // Finding the team that the scouting is for
            const team = event.teams.find(t => t.number == teamNumber);

            // Checking that the team exists
            if (!team) return;

            const displayCard = db_scoutingCards.find(c => c.type == type);

            // Reloading the info on the dashboard if it is currently shown
            if (eventKey == currentEvent.info.key && teamNumber == db_currentRobot.number) displayCard.populate();
        });

        // TODO: Instances of this class could probably just be stored inside each robot.
        class CommentDisplayList {
            /**
             * Generates a list of comments that allows you to add comments and things like that
             * @param {string} headerQuery The query selector of header of the card that this is generating everything inside
             * @param {string} containerQuery A query selector of html Node that you want to put the list inside
             * @param {string[]} existingComments An array of all the existing comments from the server
             * @param {MatchScoutingCollection} matchScoutingCollection A team's matchScouting
             */
            constructor (header, container, existingComments, matchScoutingCollection) {
                this.header = document.querySelector(header);
                this.container = container;

                this.commentDisplays = [];
                this.matchComments = [];
        
                this.populate(existingComments, matchScoutingCollection);
        
                // Button for displaying the modal that lets you add comments
                this.showCommentModalButton = createElementFromText(`
                    <button class="btn btn-primary">Add <span class="material-icons">add</span></button>
                `);
                this.showCommentModalButton.addEventListener("click", this.showCommentModal.bind(this));
                this.header.appendChild(this.showCommentModalButton);
        
                // Add comment modal
        
                // Creating an Id for bootstrap that will pretty much never be the same
                const uniqueId = Date.now() + Math.random();
        
                // creating this as a separate element so we can read it's value later
                this.commentsTextarea = createElementFromText(`
                    <textarea class="form-control" placeholder="Comment" id="${uniqueId}"></textarea>
                `);
                this.commentsTextareaContainer = createElementFromText(`
                    <div class="form-floating">
                    </div>`
                );
        
                // This has to be inserted after the textarea so it can't just be created at the same time as the container
                const textareaLabel = createElementFromText(`<label for="${uniqueId}"> Comment </label>`);
        
                this.commentsTextareaContainer.append(this.commentsTextarea, textareaLabel);
        
                // also creating this outside the card so that you can add an event listener to it
                this.addCommentButton = new CustomBootstrap.Button({
                    content: `Add Comment <span class="material-icons">add</span>`,
                    classes: [
                        'btn-success'
                    ]
                });
                // adding an event listener to add the contents of the comments text area on click
                // Checking for things like no comment will be done in the add comments method and not here
                this.addCommentButton.on('click', _ => {
        
                    // Adding the comments
                    this.addComment(this.commentsTextarea.value);
        
                    // Clearing the textarea
                    this.commentsTextarea.value = "";
        
                    // hiding the modal
                    this.commentModal.hide();
                });
        
                this.commentModal = new CustomBootstrap.Modal({ 
                    title: "Add Comments",
                    body: this.commentsTextareaContainer,
                    buttons: [this.addCommentButton],
                    size: 'lg'
                });
            }
        
            /**
             * Combines both of this team's comment arrays
             * @type {CommentDisplay[] || MatchCommentDisplay[]}
             */
            get comments () {
                return [
                    ...this.commentDisplays,
                    ...this.matchComments,
                ]
            }
        
            /**
             * Goes through each comment and renders it.
             */
            render () {
                this.container.innerHTML = "";
                this.comments.forEach(comment => {
                    comment.render(this.container);
                });
            }
        
            /**
             * Just calls this.commentModal.show() for now
             */
            showCommentModal () {
                this.commentModal.show();
            }
        
            /**
             * Changes the comments of the display based off of a comments array and match scouting collection
             * @param {string[]} comments An array of comments that already have been added
             * @param {MatchScoutingCollection} matchScoutingCollection A collection of match scouting comments
             */
            setComments(comments, matchScoutingCollection) {
                // Creates a new comment display for each comment string
                // !! matchScoutingCollection so if you give an empty array it will clear ([] false but !![] is true)
                if (!!comments) this.commentDisplays = comments.map(comment => new CommentDisplay(comment)).reverse();
        
                // Creates displays for all of the defensive and normal comments
                // !! matchScoutingCollection so if you give an empty array it will clear ([] false but !![] is true)
                if (!!matchScoutingCollection) this.matchComments = matchScoutingCollection.matches.map(match => {
                    const { overall } = match;
                    // Returns an empty array because it will be removed in the flatten
                    if (!overall) return [];
                    const { comments, defensiveComments } = overall;
        
                    // if either type of comment doesn't exist it will just be an empty array 
                    // because that gets removed when you flatten the array
                    return [ 
                        comments ? new MatchCommentDisplay(comments) : [],
                        defensiveComments ? new MatchCommentDisplay(defensiveComments) : [], 
                    ];
                }).flat(Infinity).reverse(); // Filters out all matches that had no comments
                // They are removed because when you flatten an empty array it essentially removes it
                // They are also flattened because each comment generated is an array of both the normal and defensive comments
            }
        
            /**
             * Adds a comment to this object's list of comments
             * @param {string} comment The comment you want to add
             */
            addComment (comment) {
                // doesn't need to do this anymore because the socket listener will do it anyways
                // this.commentDisplays.push(
                //     new CommentDisplay(comment)
                // );
        
                socket.emit("add comment", { teamNumber: db_currentRobot.number, eventKey: currentEvent.info.key, comment }); 
            }
        
            /**
             * Sets the list's comments then renders it
             * @param {string[]} comments An array of comments that already have been added
             * @param {MatchScoutingCollection} matchScoutingCollection A collection of match scouting comments
             */
            populate (comments, matchScoutingCollection) {
                this.setComments(comments, matchScoutingCollection);
                this.render();
            }
        }
        
        class CommentDisplay {  
            /**
             * Composition of card that is designed for displaying commnets
             */
            constructor (comment) {
                this.comment = comment;
                // Creates a new card with no header that we can write whatever into
                this.card = new CustomBootstrap.Card({
                    body: comment,
                    height: "",
                });
            }
            
            addCardToContainer (container) {
                container.appendChild(this.card.el);
            }
        
            addEditButton() {
        
            }
        
            render (container) {
                this.addEditButton();
                this.addCardToContainer(container);
            }
            
            edit () {
        
            }
        }
        
        class MatchCommentDisplay {
            /**
             * Composition of CommentDisplay that has 
             * @param {*} comment 
             */
            constructor (comment) {
                this.commentDisplay = new CommentDisplay(comment);
            }
        
            render (container) {
                this.commentDisplay.addCardToContainer(container);
            }
        }
        
        const db_addCommentsContainer = document.querySelector("#db--add-comments-container");
        const db_addCommentsHeader = "#db--add-comments-header";

        db_addCommentsContainer.classList.add("overflow-scroll");
        db_addCommentsContainer.style.height = "300px";

        const db_commentDisplayList = new CommentDisplayList(db_addCommentsHeader, db_addCommentsContainer);
        
        socket.on("comments", comments => {
            db_commentDisplayList.populate(comments);
        });        

        const otherDataContainer = document.querySelector("#db--combined-data-container");
        const otherData = {
            "Average Score Contribution": bot => {
                return bot.matchScouting.averageContribution;
            },
            "Max Score Contribution": bot => {
                return bot.matchScouting.maxContribution;
            }
        };

        const populateOtherData = _ => {
            otherDataContainer.innerHTML = "";

            const otherDataHtml = Object.entries(otherData).map(([key, value]) => {
                return createPitQA(key, value(db_currentRobot), { preventNormalCase: true });
            });

            otherDataContainer.append(...otherDataHtml);
        }

        const db_heatmap = document.querySelector('#db--heatmap');
        const db_heatmapCanvas = new Canvas (db_heatmap);
        const db_autoCheckbox = document.querySelector('#db--heatmap-auto-toggle');
        const db_teleopCheckbox = document.querySelector('#db--heatmap-teleop-toggle');
        const db_endgameCheckbox = document.querySelector('#db--heatmap-endgame-toggle');
        TimeSegmentSelect.heatmapCheckboxesObject = {
            auto: db_autoCheckbox,
            teleop: db_teleopCheckbox,
            endgame: db_endgameCheckbox,
        }

        TimeSegmentSelect.heatmapCheckboxes.forEach((cb) => {
            cb.addEventListener('change', () => {
                TimeSegmentSelect.loadHeatmapForTeam();
            });
        });

        TimeSegmentSelect.loadHeatmapForTeam = function() {
            // const { auto, teleop, endgame } = pl_currentHeatmap;
            const heatmap = db_currentHeatmap;// pl_combineHeatmaps(db_autoCheckbox.checked ? auto : [], db_teleopCheckbox.checked ? teleop : [], db_endgameCheckbox.checked ? endgame : []);
            if (!heatmap) return;

            const checkedHeatmaps = [];
            if (db_autoCheckbox.checked) checkedHeatmaps.push("auto");
            if (db_teleopCheckbox.checked) checkedHeatmaps.push("teleop");
            if (db_endgameCheckbox.checked) checkedHeatmaps.push("endgame");

            const db_heatmapFieldView = currentEvent.field.copy;

            // Resetting the properties because the heatmap is independent from the field orientation
            db_heatmapFieldView.setProperties([]);
            db_heatmapFieldView.draw(db_heatmapCanvas, () => {
                heatmap.draw(db_heatmapCanvas, checkedHeatmaps);
            });

            db_heatmap.classList.remove('mirror-x', 'mirror-y', 'rotate-180');

            db_heatmap.classList.add(...(currentEvent.field.properties ? currentEvent.field.properties : []));

            // heatmap.draw(db_heatmap, checkedHeatmaps);

            // pl_drawHeatmap(db_heatmap, heatmap);
        }


        onEventChange();
    }
    
    const { query } = page;
    const [
        team,
        robot
    ] = [
        query.get("team"),
        query.get("robot"),
    ];

    const number = team || robot;
    if (number && currentEvent.teams.find(t => t.number == number)) {
        db_teamSelect.value =  number;
        // This is needed to move populate page into later in the event loop
        // this allows it to run after the pit scouting display code which makes the display actually display stuff
        setTimeout(db_populatePage);
    } 
}

class TimeSegmentSelect {
    // this is set once all the checkboxes are defined
    static heatmapCheckboxesObject;

    static get heatmapCheckboxes() {
        if (!this.heatmapCheckboxesObject) return [];
        return Object.values(this.heatmapCheckboxesObject);
    }

    /**
     * An array of all the match cards the selects will effect
     * @type {db_MatchCard[]}
     */
    static matchCards = [];

    /**
     * The time of the button that is currently selected within the input group
     * @type {string}
     */
    static selectedButton = "overall";

    /**
     * Adds an option to a button group that will 
     * set the times on all the match cards when selected
     * @param {string} time The name of the time segment ("auto", "teleop", etc); 
     * @param {string} color The name of the bootstrap color this button will be
     * @param {Node} container The button group to add this to 
     */
    constructor (time, color, container) {
        this.time = time;
        this.color = color;
        this.container = container;

        this.build();
    }

    /**
     * Creates all the html for this select and adds it to the container
     * @private
     */
    build () {
        // Generating a uniqueId since it is needed for bootstrap
        const uniqueId = Date.now() + Math.random();

        this.input = createElementFromText(`<input type="radio" class="btn-check py-3" name="btnradio" id="${uniqueId}" autocomplete="off">`);
        this.label = createElementFromText(`<label class="btn btn-outline-${this.color}" for="${uniqueId}">${upperCaseFirstLetter(this.time)}</label>`);

        this.input.addEventListener("change", _ => this.onChange());

        this.container.append(this.input, this.label);
    }

    /**
     * Sets the time segments on all of the match cards
     * @private
     */
    onChange () {
        // This function will also trigger when this is unchecked
        // So this checks for that case
        if (!this.input.checked) return;

        // Getting the set of match cards that all TimeSegmentSelects interface with
        const { matchCards, heatmapCheckboxes, heatmapCheckboxesObject, loadHeatmapForTeam } = TimeSegmentSelect;

        matchCards.forEach(card => {
            card.selectSegment(this.time);
        });

        heatmapCheckboxes.forEach(checkbox => {
            // Sets all of the checkboxes to false if this isn't overall and true if it is overall
            checkbox.checked = this.time == "overall";
        });

        const checkbox = heatmapCheckboxesObject[this.time];
        if (checkbox) checkbox.checked = true;

        loadHeatmapForTeam();

        TimeSegmentSelect.selectedButton = this.time;
    }
}

class db_MatchCard {
    static addScrollLink (container, button, match) {
        if (!match) return;
        const { compLevel, matchNumber } = match;
        const otherTeamsRowQuery = `#db--match-row-${compLevel}-${matchNumber}-red`;
        const otherTeamsRow = document.querySelector(otherTeamsRowQuery);
        const otherTeamsJquery = $(otherTeamsRowQuery);

        // jQuery doesn't just have elements be null if there is an invalid query selector
        // so I'm just checking this way
        if (otherTeamsRow) {
            // role="button" href = "${otherTeamsRowQuery}"

            button.addEventListener("click", _ => {
                const height = otherTeamsJquery.height() * 2;
                const { top } = otherTeamsJquery.offset();

                // const scroll = $(window).scrollTop();
                window.scroll({ top: top - height })//({ top: top - scroll });
            });

            container.appendChild(button);
        }

    }

    static segments = [
        { name: "auto", color: "success", timeStart: 0, timeEnd: 15 },
        { name: "teleop", color: "primary", timeStart: 15, timeEnd: 120 },
        { name: "endgame", color: "warning", timeStart: 120, timeEnd: 150 },
        { name: "overall", color: "danger", timeStart: 0, timeEnd: 150 },
    ];

    // static orientations = {
    //     normal: [],
    //     "flip-x": ["mirror-x"],
    //     "flip-y": ["mirror-y"],
    //     "flip-xy": ["mirror-x", "mirror-y"],
    // }

    constructor(match) {
        this.match = match;
        this.card = createElementFromText(`<div class="card w-100"></div>`);
        this.traceCanvas = createElementFromText('<canvas no-select"></canvas>');
        this.traceCanvasObj = new Canvas(this.traceCanvas);
        let parsedTrace;
        try {
            parsedTrace = JSON.parse(match.trace);
        } catch (e) {
            parsedTrace = match.trace;
        }
        this.traceObject = new db_Trace(parsedTrace);
        this.fieldView = currentEvent.field;
        // this.fieldView = currentEvent.field.copy;
        // const { properties } = this.fieldView;
        // const { alliance } = match;
        // if (alliance == "blue") { 
        //     const fieldSymmetry = "mirror-x";
        //     const duplicateIndex = properties.indexOf(fieldSymmetry);
        //     if (duplicateIndex > -1) properties.splice(duplicateIndex, 1);
        //     else properties.push(fieldSymmetry);
        // };
        this.startTimeSliderDiv = createElementFromText(`
        <div class = "px-3">
            <label for="db--match-trace-start-time-slider" class="form-label"> Start Time </label>
            <input type="range" class="form-range db--start-slider" min="0" max="150" step="1">
        </div>
        `);
        this.endTimeSliderDiv = createElementFromText(`
        <div class = "px-3">
            <label for="db--match-trace-end-time-slider" class="form-label"> End Time </label>
            <input type="range" class="form-range db--end-slider" min="0" max="150" step="1">
        </div>
        `);

        //slider stuff
        this.startSlider = this.startTimeSliderDiv.querySelector(".db--start-slider");
        this.endSlider = this.endTimeSliderDiv.querySelector(".db--end-slider");

        const { selectedButton } = TimeSegmentSelect;
        const { segments } = db_MatchCard;
        const { timeStart, timeEnd } = segments.find(s => s.name == selectedButton) || {};
        this.startSlider.value = timeStart || 0;
        this.endSlider.value = timeEnd || 150;

        // this.matchInfo = createElementFromText(`<div class="container-fluid p-0"></div>`);
        const uniqueId = Date.now();

        this.matchInfo = createElementFromText(`
            <div class = "container-fluid no-select"></div>
        `);

        const { preScoutingKey } = this.match;

        if (preScoutingKey) this.matchInfo.append(createElementFromText(`
            <p> Pre Scouting From: ${preScoutingKey}</p>
        `));

        const row = createElementFromSelector(".row");
        const otherTeamsCol = createElementFromSelector(".col");
        db_MatchCard.addScrollLink(otherTeamsCol, createElementFromText(`<button class = "btn btn-primary btn-sm"> Other Teams </button>`), match);
        row.appendChild(otherTeamsCol);
        
        if (this.match.match) {
            const { videos } = this.match.match;

            const [ matchVideo ] = videos;

            if (matchVideo) {
                const { type, key } = matchVideo;
                if (type == "youtube") {
                    const videoCol = createElementFromSelector(".col");
                    // Creating a link to the youtube video
                    const link = createElementFromText(`<a href ="https://youtu.be/${key}" target="_blank">Video</a>`);

                    videoCol.appendChild(link);
                    row.appendChild(videoCol);
                }
                
            }
        }
        

        this.timeSegmentButtonGroup = createElementFromText('<div class="btn-group-sm" role="group" aria-label="Match Card Button Group"></div>');
        this.matchInfo.append(row, this.timeSegmentButtonGroup);

        // Stringifiying an array is readable to the client if it just contains numbers
        this.cycleTimes = createElementFromText(`<p>Cycle Times: ${JSON.stringify(match.cycleTimes)}</p>`);
        this.averageCycle = createElementFromText(`<p>Average Cycle: ${match.averageCycle}</p>`);
        this.matchInfo.append(this.cycleTimes, this.averageCycle);

        this.checkboxes = [];
        this.timeInfos = [];

        this.segmentSelects = {};

        db_MatchCard.segments.forEach(section => {
            const { name: sectionName, color, timeStart, timeEnd } = section;
            if (!this.match[sectionName]) return;
            let info;
            try {
                info = JSON.parse(this.match[sectionName]);
            } catch {
                info = this.match[sectionName];
            }
            const { selectedButton } = TimeSegmentSelect;

            const nameAndId = sectionName+  "-" + uniqueId;
            const checkbox = createElementFromText(`<input type = "checkbox" class = "btn-check" id = "${nameAndId}Checkbox" autocomplete = "off"${sectionName == selectedButton ? " checked" : ""}></input>`);
            const button = createElementFromText(`<label class = "btn btn-outline-${color} py-3" for = "${nameAndId}Checkbox">${sectionName}</label>`);
            const timeInfo = createElementFromText(`<div class = "${sectionName == selectedButton? "" : "d-none "}row"></div>`);

            this.segmentSelects[sectionName] = checkbox;

            this.timeInfos.push(timeInfo);
            this.checkboxes.push(checkbox);
            checkbox.addEventListener("change", e => {
                if (!checkbox.checked) return;
                this.checkboxes.forEach(c => {
                    if (c != checkbox ) c.checked = false;
                });
                this.timeInfos.forEach(timeInfo => timeInfo.classList.add("d-none"));

                this.startSlider.value = timeStart;
                this.endSlider.value = timeEnd;

                timeInfo.classList.remove("d-none");
                this.draw();
            });

            this.timeSegmentButtonGroup.appendChild(checkbox);
            this.timeSegmentButtonGroup.appendChild(button);

            // if (info && Object.keys(info).length) timeInfo.appendChild(createElementFromText(`<h5><b> ${sectionName} <b></h5>`));
            if (!info) return;

            if (match instanceof MatchScouting[2023]) {
                const tbaBalance = match.tbaBalance(sectionName);
                const tbaBalanceAmount = match.tbaDockedAmount(sectionName);
                if (tbaBalance) info.tbaChargeStation = camelCaseToNormalCasing(tbaBalance);
                // Only one robot can balance in auto so that isn't really useful info
                if (tbaBalanceAmount && sectionName != "auto") info.tbaRobotsBalancing = tbaBalanceAmount;
                const { timeSegmentScore, totalScore } = FIRSTYear[2023]
                // Using Object.assign will put the score at the top so when you do Object.keys it will be the first one
                info = Object.assign({ score: sectionName == "overall" ? totalScore(match) :  timeSegmentScore(sectionName)(match) }, info);
            }
            
            Object.keys(info).forEach(key => {
                timeInfo.appendChild(createPitQA(key + ":", info[key], { timeSegment: sectionName, match: this.match }));
            });
            this.matchInfo.appendChild(timeInfo);
        });
        
        this.cardTitle = createElementFromText(`
            <h5 class="card-title">${match.compLevel ? match.compLevel + ", ": ""}Match #${match.matchNumber} - ${match.scout || match.scoutName}</h5>
        `);
        this.cardContents = createElementFromSelector(`div.card-body`);

        this.cardContents.appendChild(this.cardTitle);

        // Getting how far off the match scouting is from the blue alliance
        const { accuracy, compLevel } = this.match;

        if (compLevel != "pr") {
            let explanationText, color; 
        
            if (typeof accuracy == "object") {
                const { difference, percentError } = accuracy;
                const absoluteAccuracy = Math.abs(difference);
                const absolutePercent = Math.abs(percentError);
                
                // Checking if the matchScoutings from the alliance members in this match
                // Getting whether the matchScouting's are above or below the blue alliance data
                const direction = Math.sign(difference) == 1 ? "below" : "above";

                // An explanation of why there is a flag
                explanationText = `
                    Between all 3 alliance members this match's score is ${absoluteAccuracy} points ${direction} the Blue Alliance's score for this alliance (${Math.round(absolutePercent * 100)}% error).
                    However, there is no way to tell which of the 3 teams have the errors.
                `;

                // The distance between green and red on the color wheel is 1/3 of the distance
                // so if we want 0 to be green and red to be 15 then 1/3 of the distance must be 15
                // therefore we want to generate 45 colors
                // const colorRange = new Color(0, 225, 0).compliment(15 * 3);

                // // Subtracting the accuracy from colorRange so that the gradient goes from green to red rather than green to blue
                // // The math.min is there to stop the colors from looping back
                // color = colorRange[colorRange.length - 1 - Math.min(absoluteAccuracy, 15)];

                // // Making the flag darken to emphasize when a match is off by like 30 points
                // if (absoluteAccuracy > 15) {
                //     // getting how much more inaccurate the match is
                //     const overflowAccuracy = absoluteAccuracy - 15;

                //     // Decreasing the lightness by an amount so that if they are off by 30 points it will be very dark red
                //     color.hsl.setLightness(1/3 - Math.min(overflowAccuracy, 15)/60);
                // }
                let colorName;
                if (absolutePercent <= 0.1) colorName = "success";
                else if (absolutePercent <= 0.2) colorName = "warning";
                else colorName = "danger"
                color = Color.fromBootstrap(colorName);

            } else {
                explanationText = accuracy;
                color = Color.fromName("gray");
            }
        
            // Creating a flag and making it a color depending on how far off the match is
            const accuracyFlag = createElementFromText(`<span class="material-icons">flag</span>`);
            // Rounding the color to the closest bootstrap value
            // color = color.closestBootstrap.color;
            accuracyFlag.style.color = color.toString();

            // Adding the flag to the title
            this.cardTitle.appendChild(accuracyFlag);
            // Adding a tooltip to the entire card title just so that the tooltip trigger hitbox triggers more often
            this.cardTitle.setAttribute("data-toggle", "tooltip");
            // Setting the tooltip text to the explanation text
            this.cardTitle.title = explanationText;

            // Activating the tooltips
            $(document).ready(function(){
                $('[data-toggle="tooltip"]').tooltip();
            });
        }
        

        // const { totalScore } = FIRSTYear[2023];
        // this.cardContents.innerHTML += `<p class = "fw-bolder fs-6"> Total Score: ${totalScore(match)} </p>`;
        // card.addEventListener("show", () => {
        //     alert(card.offsetWidth)

        // });
        const interval = setInterval(() => {
            if (this.card.offsetWidth) {
                this.resize()

                clearInterval(interval);
            }

        });


        window.addEventListener("resize", this.resize.bind(this));

        this.card.appendChild(this.traceCanvas);
        this.card.appendChild(this.startTimeSliderDiv);
        this.card.appendChild(this.endTimeSliderDiv);
        this.cardContents.appendChild(this.matchInfo);
        this.card.appendChild(this.cardContents);

        //puts the card in a column
        this.col = createElementFromText(`<div class="col-sm-9 col-md-9 col-lg-6 col-xl-4 px-2"></div>`);
        this.col.appendChild(this.card);

        // puts the column in the container
        // db_matchCardContainer.appendChild(this.col);

        //event listener to change the trace according to the slider values
        [this.startSlider, this.endSlider].forEach(input => {
            input.addEventListener("input", (e) => {
                this.draw.bind(this)();
            });
            ["mousemove", "mousedown", "mouseup"].forEach(eventType => input.addEventListener(eventType, (e) => e.stopPropagation(), false));
        });
    }

    selectSegment (segment) {
        const segmentSelect = this.segmentSelects[segment];
        segmentSelect.checked = true;
        segmentSelect.dispatchEvent(new Event("change"));
    }

    // Slider Getters
    get startValue() {
        return this.startSlider.value;
    }
    get endValue() {
        return this.endSlider.value;
    }

    // Display stuff
    // Draws the trace
    draw() {
        this.fieldView.draw(this.traceCanvasObj, () => {
            this.traceObject.draw(this.traceCanvasObj, this.startValue, this.endValue);
        });
    }

    resize() {
        this.traceCanvas.style.width = this.card.offsetWidth + 'px';
        this.traceCanvas.style.height = this.card.offsetWidth / 2 + 'px';

        this.draw();
    }
}

class HeatmapRectangle {
    /**
     * Gets an array of cubes that will fill a canvas with a certain amount of rectangles for x and y
     * @param {number} amountX How many rectangles wide the canvas should be
     * @param {number} amountY How many rectangles high the canvas should be
     * @param {number} scale The max that all the rectangles should base their color off of 
     * @param {[Color, Color]} gradientColors The first and last color in the gradient this heatmap should pick from
     * @returns {HeatmapRectangle[]}
     */
    static getRects(amountX, amountY, scale, gradientColors, linearFade) {
        return new Array(amountX).fill().map((_, i) => {
            return new Array(amountY).fill().map((_, j) => {
                const width = 1 / amountX;
                const height = 1 / amountY;
                // this refers to the class HeatmapClass but if you make an extension it will create an instance of that extension
                return new this (i * width, j * height, width, height, scale, gradientColors, i, j, linearFade);
            });
        }).flat(Infinity);
    }

    /**
     * Generates a rectangle designed to be used for heatmaps
     * @param {number} x The x-pos of the top left corner of the rect (max of 1) 
     * @param {number} y The y-pos of the top left corner of the rect (max of 1) 
     * @param {number} width The width of the rect (max of 1) 
     * @param {number} height The height of the rect (max of 1) 
     * @param {number} scale The max that all the rectangles should base their color off of 
     * @param {[Color, Color]} gradientColors The first and last color in the gradient this heatmap should pick from
     * @param {number} heatmapX How many rectangles are to the left of this rect
     * @param {number} heatmapY How many rectangles are above of this rect
     */
    constructor (x, y, width, height, scale, gradientColors, heatmapX, heatmapY, linearFade) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.gradientColors = gradientColors;
        this.heatmapX = heatmapX;
        this.heatmapY = heatmapY;

        const [ startColor, endColor ] = gradientColors;
        this.gradient = (linearFade ? endColor.linearFade(startColor, scale) : endColor.exponentialFade(startColor, scale, 1.3)).colors;
        this.gradient.push(startColor);

        this.gradient.reverse();
        this.amount = 0;
    }

    /**
     * Gets this rectangle's x and y coords relative the the canvas
     * @param {Canvas | Node} canvas A canvas element or canvas class
     * @returns {{ x: number, y: number, width: number, height: number }}
     */
    getRect (canvas) {
        return {
            x: this.x * canvas.width,
            y: this.y * canvas.height,
            width: this.width * canvas.width,
            height: this.height * canvas.height,
        };
    }
    
    get color () {
        return this.gradient[this.amount];
    }

    /**
     * Draws this rectangle onto a canvas
     * @param {Canvas} canvas the canvas to draw this onto
     */
    draw (canvas) {
        const { context } = canvas;
        context.fillStyle = this.color.toString("rgba");
        const { x, y, width, height } = this.getRect(canvas);
        context.fillRect(x, y, width, height);
    }
}

class GridHeatmapRectangle extends HeatmapRectangle {
    static resizeGridHeatmap (canvas, container) {
        const padding = 32;
        const { width } = container.getBoundingClientRect();
        canvas.width = width - padding;
    
        // Aspect ratio of grid image
        canvas.height = canvas.width * 43/184;
    }

    static getGridArray = FIRSTYear[2023].getRow("overall");

    /**
     * Generates a rectangle designed to be used for grid heatmap
     * @param {number} x The x-pos of the top left corner of the rect (max of 1) 
     * @param {number} y The y-pos of the top left corner of the rect (max of 1) 
     * @param {number} width The width of the rect (max of 1) 
     * @param {number} height The height of the rect (max of 1) 
     * @param {number} scale The max that all the rectangles should base their color off of 
     * @param {[Color, Color]} gradientColors The first and last color in the gradient this heatmap should pick from 
     * @param {number} heatmapX How many rectangles are to the left of this rect
     * @param {number} heatmapY How many rectangles are above of this rect
     */
    constructor () {
        super (...arguments);
        this.heatmapY = 2 - this.heatmapY;
        this.getRow = GridHeatmapRectangle.getGridArray(this.heatmapY);
    }

    setAmount (matches) {
        this.amount = matches.reduce((acc, match) => {
            const row = this.getRow(match);
            if (!row) return acc;
            return acc + (+row[this.heatmapX]);
        }, 0);
    }
}

/**
 * Rounds a number down to a certain digit
 * @param {number} number The number you want to round
 * @param {number} digits Which digit you want to round it to. 
 * - If you want to round it to the X00 place you would put 2 because 10 ^ 2 is 100
 * - If you want to round it to the 0.0X place you would put -2 because 10 ^ -2 is 0.01
 * @returns {number}
 */
function roundToDigit(number, digits) {
    const powerOfTen = 10 ** (digits);
    // example: Math.round(x*100)/100 makes the number have only 2 decimal places
    // I have to do the stupid thing where I do / powerOfTen ** -1 instead of * powerOfTen because of floating point being strange
    return Math.round(number / powerOfTen) / (powerOfTen ** -1);
}

function createGridDisplay (match, time) {
    const grid = match[time].grid;
    if (!grid) return [];
    const { color } = db_MatchCard.segments.find(t => t.name == time);

    const rows = grid.split("-").map((r, i) => {
        const row = createElementFromSelector("div.row");
        row.style.display = "flex";

        const cols = r.split("");
        cols.forEach((c, j) => {
            const div = document.createElement("div");
            // div.style.width = div.style.height = "15px";
            div.classList.add(+c ? `bg-${color}` : "bg-dark", "border", "border-light",  "m-0", "p-0", "col", "text-center");
            const img = !i ? hybrid :  j % 3 == 1 ? cube : cone;
            +c ? div.appendChild(img.cloneNode(true)) : div.innerHTML += "_";
            // 
            row.appendChild(div);
        });
        return row;
    }).reverse();

    return rows;
}

const db_gridColumnFilled = col => col && col.innerHTML != "_";

//creates pitscout "table"
function createPitQA(question, answer, options) {
    switch (question) {
        case "level:":
            question = "charged:";
            break;
        case "notLevel:":
            question = "notCharged:";
            break;
        case "tipped:":
            question = "docked:";
            break;
        case "notDocked:":
            question = "notDocked:";
            break;
        default: 
            break;
    }

    const { header, match, timeSegment, preventNormalCase } = options || {};
    // console.log(question);

    const row = document.createElement('div');
    row.classList.add('row');

    // creates question column
    const qCol = document.createElement('div');
    qCol.classList.add('col', 'd-flex', 'flex-row'); // change size? (col-6)

    const q = document.createElement('p'); // question text
    if (header) q.classList.add("fs-5");
    q.classList.add('fw-bold');
    q.style.textAlign = 'left';
    const questionNormalCasing = preventNormalCase ? question : camelCaseToNormalCasing(question);
    q.innerText = questionNormalCasing;
    qCol.appendChild(q);

    if (question == "grid:") {
        const gridContainer = createElementFromSelector("div.pb-2");
        gridContainer.appendChild(q);

        
        if (timeSegment == "overall") {
            const grids = ["auto", "teleop", "endgame"].map(time => createGridDisplay(match, time));

            const overallRows = createGridDisplay(match, "overall");

            const rows = overallRows.map((row, i) => {
                const rowEl = createElementFromSelector("div.row");
                rowEl.style.display = "flex";

                const gridRows = grids.map(g => g[i].childNodes);

                Array.from(row.childNodes).map((col, j) => {
                    // if (db_gridColumnFilled(col)) return col;
                    const cols = gridRows.map(gr => gr[j]);
                    const [ autoCol, teleopCol, endgameCol ] = cols;
                    const [ autoFilled, teleopFilled, endgameFilled ] = cols.map(db_gridColumnFilled);
                    const filledCol = autoFilled ? autoCol : teleopFilled ? teleopCol : endgameFilled ? endgameCol : col;

                    // Cloning the node so it isn't removed from it's row so that the rows aren't offset
                    rowEl.appendChild(filledCol.cloneNode(true));
                });

                return rowEl;
            });
            gridContainer.append(...rows);
        } else {
            const rows = createGridDisplay(match, timeSegment);
            gridContainer.append(...rows);
        }

        return gridContainer;
    }

    
    // create answer column
    const aCol = document.createElement('div');
    aCol.classList.add('col'); // change size? (col-6)
    const a = document.createElement('p'); // answer text
    a.innerText = typeof answer == "number" ? roundToDigit(+answer, -2) : answer;
    aCol.appendChild(a);

    // appends everything to the row and returns it
    row.appendChild(qCol);
    row.appendChild(aCol);
    return row;
}