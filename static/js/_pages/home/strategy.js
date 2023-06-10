const str_onlyTatorCheckbox = new CustomBootstrap.CheckboxGroup(document.querySelector('#str--only-tator-check'));
str_onlyTatorCheckbox.addOption('Only Tator Matches', 'only-tator-matches', false);

const str_matchSelect = new CustomBootstrap.Select(document.querySelector('#str--match-select'), {
    hideDisabled: true
});

str_onlyTatorCheckbox.on('change', () => {
    if (str_onlyTatorCheckbox.isSelected('only-tator-matches')) {
        str_matchSelect.disableOptions(
            ...str_matchSelect.options.filter(o => {
                if (!o.properties) return true;
                return !o.properties.hasTeam(2122);
            }).map(o => o.value)
        );
    } else {
        str_matchSelect.enableAll();
    }
});

// TODO: Build this as a class system
class Str_AllianceStrategy {
    constructor(color) {
        this.color = color;
    }
}

class ProjectedGridDisplay {
    constructor (container) {
        this.container = container;
        this.subContainer = document.createElement("div");
        this.build();
    }

    async build() {
        this.title = createElementFromText(`<h6>Projected Grid</h6>`);
        this.subContainer.append(this.title);

        this.image = new CanvasImage(`../static/pictures/2023/grid.jpg`);
        await this.image.render();
        this.canvas = document.createElement("canvas");
        this.subContainer.appendChild(this.canvas);

        this.canvasClass = new Canvas(this.canvas);


        window.addEventListener("resize", this.resize.bind(this));
    }

    draw() {
        this.image.draw(this.canvasClass);
        
        if (!this.grid) return;

        const { teamGrid } = this;

        const { context, width, height } = this.canvasClass;

        teamGrid.forEach((row, i) => {
            // i is divided by 3 because the grid is e nodes height
            // 0.5 is added because it has half a node of padding
            const y = (i + 0.5)/3;
            const startY = i/3;
            row.forEach((node, j) => {
                if (!node) return;
                // j is divided by 9 because the grid is 9 nodes wide
                // 0.5 is added because it has half a node of padding
                const x = (j + 0.5)/9;
                const startX = j/9;
                const text = new CanvasText(node, { x, y, options: {
                    // align: "left",
                    // baseline: "top",
                }});

                const rectangle = [startX * width, startY * height, width/9, height/3];

                context.fillStyle = "rgba(30, 200, 30, 0.75)";
                context.fillRect(...rectangle);
                context.strokeStyle = "rgb(0, 0, 0)";
                context.strokeRect(...rectangle);

                text.draw(this.canvasClass);
            });
        });
    }

    resize() {
        const padding = 32;
        const { width } = this.container.getBoundingClientRect();
        this.canvas.width = width - padding;
    
        // Aspect ratio of grid image
        this.canvas.height = this.canvas.width * 43/184;        

        this.draw()
    }

    render(grid) {
        this.container.appendChild(this.subContainer);

        this.grid = grid;
        this.resize();
    }

    get teamGrid() {
        const teamGrid = this.grid.map(row => row.map(node => (node && node.number)));

        // Reversing the grid so the top nodes are on top
        return teamGrid.reverse();
    }
}

const str_els = ['red', 'blue'].reduce((acc, cur) => {
    const strategyContainer = document.querySelector(`#str--${cur}-global-strategy-container`);

    const globalStrategySelect = new CustomBootstrap.Select(document.createElement('select'));
    const globalStrategyCheckbox = new CustomBootstrap.CheckboxGroup(document.createElement('div'));
    const globalStrategyRadio = new CustomBootstrap.RadioGroup(document.createElement('div'));

    globalStrategySelect.hide();
    globalStrategyCheckbox.hide();
    globalStrategyRadio.hide();

    strategyContainer.appendChild(globalStrategySelect.el);
    strategyContainer.appendChild(globalStrategyCheckbox.el);
    strategyContainer.appendChild(globalStrategyRadio.el);

    acc[cur] = {
        selects: Array.from(document.querySelectorAll(`.str--${cur}`)).map(el => {
            return new CustomBootstrap.Select(el);
        }),
        table: document.querySelector(`#str--${cur}-table`),
        canvas: document.querySelector(`#str--${cur}-chart`),
        card: document.querySelector(`#str--${cur}-card`),
        color: cur,
        chart: null,
        strategyContainer: document.querySelector(`#str--${cur}-strategies`),
        globalStrategies: {
            select: globalStrategySelect,
            checkbox: globalStrategyCheckbox,
            radio: globalStrategyRadio
        },
        robotStrategies: new Array(3).fill().map(() => {
            const select = new CustomBootstrap.Select(document.createElement('select'));
            const checkbox = new CustomBootstrap.CheckboxGroup(document.createElement('div'));
            const radio = new CustomBootstrap.RadioGroup(document.createElement('div'));

            select.hide();
            checkbox.hide();
            radio.hide();

            const container = document.querySelector(`#str--${cur}-team-strategy-container`);

            const nameCol = document.createElement('div');
            nameCol.classList.add('col-12');

            const name = document.createElement('h5');
            name.classList.add('text-center');
            nameCol.appendChild(name);
            container.appendChild(nameCol);

            container.appendChild(select.el);
            container.appendChild(checkbox.el);
            container.appendChild(radio.el);

            return {
                select,
                checkbox,
                radio,
                name
            }
        })
    }

    acc[cur].card.style.backgroundColor = Color.fromBootstrap(cur == 'red' ? 'danger' : 'primary').hsl.setLightness(.8).toString();

    return acc;
}, {
    red: {},
    blue: {}
});
const str_winningAlliance = document.querySelector('#str--projected-winning-alliance');
const str_winningMargin = document.querySelector('#str--projected-winning-margin');
const str_winningProbability = document.querySelector('#str--projected-winning-probability');

const str_redProjectedScore = document.querySelector("#str--red-projected-score");
const str_blueProjectedScore = document.querySelector("#str--blue-projected-score");

const str_projectedGrids = {
    red: new ProjectedGridDisplay(str_redProjectedScore),
    blue: new ProjectedGridDisplay(str_blueProjectedScore),
} 

const str_projectedScores = {
    red: str_redProjectedScore,
    blue: str_blueProjectedScore,
}

const str_getSelected = () => {
    try {
        return {
            red: {
                global: str_els.red.globalStrategies[str_strategies[currentEvent.info.year].global.type].selectedValue,
                robots: str_els.red.robotStrategies.map(s => s[str_strategies[currentEvent.info.year].robot.type].selectedValue)
            },
            blue: {
                global: str_els.blue.globalStrategies[str_strategies[currentEvent.info.year].global.type].selectedValue,
                robots: str_els.blue.robotStrategies.map(s => s[str_strategies[currentEvent.info.year].robot.type].selectedValue)
            },
            comments: document.querySelector('#str--comments').value
        } 
    } catch {
        return {};
    }
}

const str_strategies = {
    2023: {
        global: {
            type: 'select',
            values: [
                '3 placers - Cycle Clockwise',
                '3 placers - Cycle Counter-Clockwise',
                '2 placers - Each robot only place on a specific side (based on driver station location or preference)',
                '1 placer - One robot place, one robot feed pieces, one robot defense'
            ]
        },
        robot: {
            type: 'checkbox',
            values: [
                'Place high',
                'Place mid',
                'Place low',
                'Place right',
                'Place center',
                'Place left',
                'Defense',
                'Cone', 
                'Cube'
            ]
        }
    }
}

mainFunctions.Strategy = async() => {
    const getSelectedTeams = (color) => str_els[color].selects.map(s => {
        if (!s.value) return;
        const { properties: team } = s.value;
        return team;
    }).filter(t => t);
    str_matchSelect.clearOptions();
    str_matchSelect.addOption('Select a match', '0', true);
    str_matchSelect.disableOption('0');

    [str_els.red, str_els.blue].forEach(({ selects, color, strategyContainer, globalStrategies, robotStrategies }) => {
        selects.forEach(select => {
            select.clearOptions();
            select.addOption('Select a team', '0', true);
            select.disableOption('0');

            currentEvent.teams.forEach(team => {
                select.addOption(team.number, team.number, false, team);
            });

            select.on('change', (e) => {
                const selectedTeams = getSelectedTeams(color);
                const redTeams = getSelectedTeams("red");
                const blueTeams = getSelectedTeams("blue");
                const rows = getSelectedTeams(color);

                const projectedScoreBreakdown = {
                    red: FIRSTMatch[2023].getProjectedScore(redTeams),
                    blue: FIRSTMatch[2023].getProjectedScore(blueTeams),
                }

                const { totalScore, grid } = projectedScoreBreakdown[color];
                str_projectedScores[color].innerHTML = "Projected Score: " + totalScore;

                str_projectedGrids[color].render(grid);

                rows.push({
                    number: 'Totals',
                    matchScouting: {
                        averageContribution: selectedTeams.reduce((acc, cur) => acc + cur.matchScouting.averageContribution, 0),
                        maxContribution: selectedTeams.reduce((acc, cur) => acc + cur.matchScouting.maxContribution, 0),
                        minContribution: selectedTeams.reduce((acc, cur) => acc + cur.matchScouting.minContribution, 0),
                        autoChargedPercentage: Math.max(...selectedTeams.map(cur => {
                            const { matchScouting } = cur;
                            return matchScouting.autoChargedPercentage;
                        })),
                    },
                    // defining then running a function so that I can more easily do stuff with selected teams
                    frameDimensions: (_ => {
                        let unCalculatedTeams = 0;
                        let returnString = selectedTeams.reduce((acc, team) => {
                            // getting the numbers in the frame dimension string of the team
                            const { dimensionNumbers } = team;

                            // If it is able to tell what the actual numbers are it will add them
                            if (dimensionNumbers.length == 2) {
                                return acc + Math.min(...dimensionNumbers);
                            }

                            // Otherwise it will mark that one of the teams had non-sense data
                            unCalculatedTeams ++;
                            return acc;
                        }, 0);

                        if (unCalculatedTeams) returnString += ` + ${unCalculatedTeams} Other Team${unCalculatedTeams == 1 ? "" : "s"}`;

                        // console.log(returnString);
                        return returnString;
                    })(),
                });

                new Table(str_els[color].table, [{
                    title: 'Team',
                    getData: (team) => team.number
                }, {
                    title: 'Max Contribution',
                    getData: (team) => Math.round(team.matchScouting.maxContribution)
                }, {
                    title: 'Average Contribution',
                    getData: (team) => Math.round(team.matchScouting.averageContribution)
                }, {
                    title: 'Min Contribution',
                    getData: (team) => Math.round(team.matchScouting.minContribution)
                }, {
                    title: "% of Matches Auto Charged",
                    getData: team => {
                        const { autoChargedPercentage } = team.matchScouting;
                        return autoChargedPercentage !== undefined ? autoChargedPercentage + "%" : "No Data";
                    },
                }, {
                    title: "Frame Dimensions",
                    getData: team => {
                        // console.log(team);
                        return team.frameDimensions || "No Data";
                    },
                }], rows, {
                    invert: true
                });

                const redData = str_els.red.selects.map(s => {
                    if (!s.value) return;
                    const { properties: team } = s.value;
                    if (!team) return;
                    return {
                        avg: team.matchScouting.averageContribution,
                        max: team.matchScouting.maxContribution,
                        min: team.matchScouting.minContribution,
                    };
                }).filter(t => t).reduce((acc, cur) => {
                    acc.avg += cur.avg;
                    acc.max += cur.max;
                    acc.min += cur.min;
                    return acc;
                }, {
                    avg: 0,
                    max: 0,
                    min: 0
                });

                const blueData = str_els.blue.selects.map(s => {
                    if (!s.value) return;
                    const { properties: team } = s.value;
                    if (!team) return;
                    return {
                        avg: team.matchScouting.averageContribution,
                        max: team.matchScouting.maxContribution,
                        min: team.matchScouting.minContribution,
                    };
                }).filter(t => t).reduce((acc, cur) => {
                    acc.avg += cur.avg;
                    acc.max += cur.max;
                    acc.min += cur.min;
                    return acc;
                }, {
                    avg: 0,
                    max: 0,
                    min: 0
                });

                const redProj = projectedScoreBreakdown["red"].totalScore,
                    blueProj = projectedScoreBreakdown["blue"].totalScore;

                if (redProj > blueProj) {
                    str_els.red.card.style.backgroundColor = Color.fromBootstrap('danger');
                    str_els.blue.card.style.backgroundColor = Color.fromBootstrap('primary').hsl.setLightness(.8).toString();
                } else if (blueProj > redProj) {
                    str_els.blue.card.style.backgroundColor = Color.fromBootstrap('primary');
                    str_els.red.card.style.backgroundColor = Color.fromBootstrap('danger').hsl.setLightness(.8).toString();
                } else {
                    str_els.red.card.style.backgroundColor = Color.fromBootstrap('danger');
                    str_els.blue.card.style.backgroundColor = Color.fromBootstrap('primary');
                }

                str_winningAlliance.innerText =
                    redProj > blueProj ? 'Red' : 
                    redProj < blueProj ? 'Blue' : 'Tie';
                str_winningAlliance.classList
                    .remove('text-danger', 'text-primary', 'text-light');
                str_winningAlliance.classList
                    .add(
                        redProj > blueProj ? 'text-danger' :
                        redProj < blueProj ? 'text-primary' : 'text-light');
                str_winningMargin.innerText = Math.round(
                    Math.abs(redProj - blueProj));
                str_winningProbability.innerText = Math.round(
                    Math.max(redProj, blueProj) / 
                    Math.min(redProj, blueProj) * 100);

                ['red', 'blue'].forEach(color => {
                    const { chart } = str_els[color];
                    if (chart) chart.destroy();

                    const ctx = str_els[color].canvas.getContext('2d');
                    str_els[color].chart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: ['Max Contribution', 'Average Contribution', 'Min Contribution'],
                            datasets: [{
                                label: 'Contribution',
                                data: color === 'red' ? [redData.max, redData.avg, redData.min] : [blueData.max, blueData.avg, blueData.min],
                                backgroundColor: Color.fromBootstrap(color === 'red' ? 'danger' : 'primary').rgba.setAlpha(.5).toString('rgba'),
                                borderColor: Color.fromBootstrap(color === 'red' ? 'danger' : 'primary'),
                                borderWidth: 1
                            }]
                        },
                        options: {
                            y: {
                                min: 0,
                                max: Math.max(redData.max, blueData.max) + 10
                            }
                        }
                    });
                });

                const clear = (el) => {
                    if (el instanceof CustomBootstrap.Element) {
                        el.clearOptions();
                        el.hide();
                    }
                }

                const matchStrategies = str_strategies[currentEvent.info.year];
                Object.values(globalStrategies)
                    .forEach(clear);
                robotStrategies.forEach(s => Object.values(s)
                    .forEach(clear));

                const setDefault = (input) => {
                    input.show();
                    if (input instanceof CustomBootstrap.Select) {
                        input.addOption('Please select a strategy', 'none');
                    }
                }

                if (matchStrategies) {
                    const input = globalStrategies[matchStrategies.global.type];
                    setDefault(input);
                    matchStrategies.global.values.forEach(s => {
                        input.addOption(s, s, false);
                    });

                    selectedTeams.forEach((team, i) => {
                        const input = robotStrategies[i][matchStrategies.robot.type];
                        setDefault(input);
                        robotStrategies[i].name.innerText = `${team.number} | ${team.info.nickname}`;
                        matchStrategies.robot.values.forEach(s => {
                            input.addOption(s, s, false);
                        });
                    });
                }
            });
        });
    });

    currentEvent.matches.forEach(match => {
        const color = match.hasTeam(2122) ? match.alliance(2122) === 'red' ? 'danger' : 'primary' : 'dark';
        str_matchSelect.addOption(`${match.compLevel} ${match.matchNumber}`, match.key, false, match, {
            classes: [`text-${color}`]
        });
    });

    str_matchSelect.on('change', async (e) => {
        const { value } = str_matchSelect;
        if (value) {
            const { properties: match } = value;
            [str_els.red, str_els.blue].forEach(({ selects, color }) => {
                selects.forEach((select, i) => {
                    select.select(match.alliances[color].teamKeys[i].slice(3), false);
                });
            });

            const [response] = await Promise.all([
                requestFromServer({
                    method: 'POST',
                    url: '/match-strategy/get-strategy',
                    body: {
                        eventKey: currentEvent.info.key,
                        matchNumber: match.matchNumber,
                        compLevel: match.compLevel
                    }
                }),
                str_els.red.selects[0].trigger('change'),
                str_els.blue.selects[0].trigger('change')
            ]);

            document.querySelector('#str--comments').value = '';

            try {
                const { red, blue } = JSON.parse(response.strategy.strategy);

                [str_els.red, str_els.blue].forEach((el) => {
                    const { global, robots } = el.color === 'red' ? red : blue;
                    
                    if (global) {
                        const input = el.globalStrategies[str_strategies[currentEvent.info.year].global.type];
                        input.select(global, false);
                    }

                    robots.forEach((robot, i) => {
                        robot.forEach((strategy, j) => {
                            const input = el.robotStrategies[i][str_strategies[currentEvent.info.year].robot.type];
                            input.select(strategy, false);
                        });
                    });
                });

                document.querySelector('#str--comments').value = response.strategy.comments;
                
            } catch {}
        }
    });

    const saveStrategy = async () => {
        const { properties } = str_matchSelect.value;
        if (!properties) {
            CustomBootstrap.alert("You can't save comments unless you have a match selected.");
            return;
        }

        const { matchNumber, compLevel } = properties;
        return requestFromServer({
            method: 'POST',
            url: '/match-strategy/save-strategy',
            body: {
                eventKey: currentEvent.info.key,
                matchNumber,
                compLevel,
                strategy: str_getSelected()
            }
        })
    }

    document.querySelector('#str--save-strategy').addEventListener('click', saveStrategy);

    return async() => {
        str_matchSelect.off('change');
        [str_els.red, str_els.blue].forEach(({ selects }) => {
            selects.forEach(select => {
                select.off('change');
            });
        });
        document.querySelector('#str--save-strategy').removeEventListener('click', saveStrategy);
    };
}