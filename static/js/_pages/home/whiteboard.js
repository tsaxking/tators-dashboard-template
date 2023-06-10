// constants used for drawing each path
const wb_colors = [
    ...new Color(255, 0, 0).hsl.setLightness(0.2).linearFade(new Color(255, 0, 0).hsl.setLightness(0.8), 3).colors,
    ...new Color(0, 0, 255).hsl.setLightness(0.2).linearFade(new Color(0, 0, 255).hsl.setLightness(0.8), 3).colors
];

const wb_driverStationLocations = {
    2022: [
        // TODO: make this dynamic
        ...new Array(3).fill().map((_, i) => {
            // corners of each box
            const corners = {
                topLeft: {
                    x: 0,
                    y: .1578125
                },
                topRight: {
                    x: .045731,
                    y: .1578125
                },
                bottomLeft: {
                    x: 0,
                    y: .344397
                },
                bottomRight: {
                    x: .045731,
                    y: .344397
                }
            }

            const color = wb_colors[i];

            return {
                // builds the 3 boxes based on the corners and the index
                x: corners.topLeft.x,
                y: corners.topLeft.y + (i * (corners.bottomLeft.y - corners.topLeft.y)),
                height: corners.bottomLeft.y - corners.topLeft.y,
                width: corners.topRight.x - corners.topLeft.x,
                robot: new WhiteboardRobot('red-' + (i + 1), color),
                options: {
                    color: color.rgb.toString(),
                    border: 1,
                    borderColor: color.clone().hsl.setLightness(0.5 * i / 3).rgb.toString()
                }
            }
        }),
        ...new Array(3).fill().map((_, i) => {
            // view comments from above
            const corners = {
                topLeft: {
                    x: .951829,
                    y: .265129
                },
                topRight: {
                    x: 1,
                    y: .265129
                },
                bottomLeft: {
                    x: .951829,
                    y: .45293
                },
                bottomRight: {
                    x: 1,
                    y: .45293
                }
            }

            const color = wb_colors[i + 3];

            return {
                x: corners.topLeft.x,
                y: corners.topLeft.y + (i * (corners.bottomLeft.y - corners.topLeft.y)),
                height: corners.bottomLeft.y - corners.topLeft.y,
                width: corners.topRight.x - corners.topLeft.x,
                robot: new WhiteboardRobot('red-' + (i + 1), color),
                options: {
                    color: color.rgb.toString(),
                    border: 1,
                    borderColor: color.clone().hsl.setLightness(0.5 * i / 3).rgb.toString()
                }
            }
        })
    ],
    2023: [
        ...new Array(3).fill().map((_, i) => {
            // view comments from above
            const corners = {
                topLeft: {
                    x: 0,
                    y: .34196
                },
                topRight: {
                    x: .039024,
                    y: .34196
                },
                bottomLeft: {
                    x: 0,
                    y: .53586
                },
                bottomRight: {
                    x: .039024,
                    y: .53586
                }
            }

            const color = wb_colors[i];

            return {
                x: corners.topLeft.x,
                y: corners.topLeft.y + (i * (corners.bottomLeft.y - corners.topLeft.y)),
                height: corners.bottomLeft.y - corners.topLeft.y,
                width: corners.topRight.x - corners.topLeft.x,
                robot: new WhiteboardRobot('red-' + (i + 1), color),
                options: {
                    color: color.rgb.toString(),
                    border: 1,
                    borderColor: color.clone().hsl.setLightness(0.5 * i / 3).rgb.toString()
                }
            }
        }),
        ...new Array(3).fill().map((_, i) => {
            // view comments from above
            const corners = {
                topLeft: {
                    x: 0,
                    y: .34196
                },
                topRight: {
                    x: .039024,
                    y: .34196
                },
                bottomLeft: {
                    x: 0,
                    y: .528544
                },
                bottomRight: {
                    x: .039024,
                    y: .528544
                }
            }

            const color = wb_colors[i + 3];

            return {
                x: 1 - corners.topRight.x,
                y: corners.topRight.y + (i * (corners.bottomRight.y - corners.topRight.y)),
                height: corners.bottomRight.y - corners.topRight.y,
                width: corners.topRight.x - corners.topLeft.x,
                robot: new WhiteboardRobot('blue-' + (i + 1), color),
                options: {
                    color: color.rgb.toString(),
                    border: 1,
                    borderColor: color.clone().hsl.setLightness(0.5 * i / 3).rgb.toString()
                }
            }
        })
    ]
}

// custom buttons for each year, currently this doesn't do anything
const wb_customButtons = {
    2022: [],
    2023: [
        // cone
        new CustomBootstrap.Button({
            content: CustomIcon.from('2023.cone').setStyle({ fill: Color.fromBootstrap('dark').rgb.toString() }).svg,
            classes: ['btn-warning'],
            onclick: () => {
                const svg = CustomIcon.from('2023.cone').setStyle({ fill: Color.fromBootstrap('dark').rgb.toString() });
                wb_currentWhiteboard.setGamePiece(svg);
            }
        }),
        // cube
        new CustomBootstrap.Button({
            content: CustomIcon.from('2023.cube').setStyle({ fill: Color.fromBootstrap('light').rgb.toString() }).svg,
            classes: ['btn-indigo', 'text-light'],
            onclick: () => {
                const svg = CustomIcon.from('2023.cone').setStyle({ fill: Color.fromBootstrap('dark').rgb.toString() });
                wb_currentWhiteboard.setGamePiece(svg);
            }
        }),
    ]
}


// selected match information dynamic card
const wb_currentInfo = new CustomBootstrap.Card({
    header: `<h5>Current Match</h5>`,
    body: `
        <p>
            {{compLevel}} - {{matchNumber}}
        </p>
        <div>
            {{strategy}}
        </div>
        <p>
            {{comments}}
        </p>
    `
}, {
    compLevel: 'N/A',
    matchNumber: 'No Match Selected',
    strategy: 'No Strategy Generated',
    comments: 'No Comments'
});

document.querySelector('#wb--current-info').appendChild(wb_currentInfo.el);

// match select
const wb_selectMatch = new CustomBootstrap.Select(document.querySelector('#wb--tator-matches'), {
    hideDisabled: true
});

const wb_tatorMatchCheck = new CustomBootstrap.CheckboxGroup(document.querySelector('#wb--tator-match-check'));

wb_tatorMatchCheck.addOption('Only Tator Matches', 'only-tator-matches', false);

wb_tatorMatchCheck.on('change', () => {
    if (wb_tatorMatchCheck.isSelected('only-tator-matches')) {
        wb_selectMatch.disableOptions(
            ...wb_selectMatch.options.filter(o => {
                if (!o.properties) return true;
                return !o.properties.hasTeam(2122);
            }).map(o => o.value)
        );
    } else {
        wb_selectMatch.enableAll();
    }
});

// dynamic comment modal
const wb_commentModal = new CustomBootstrap.Modal({
    title: 'Comments',
    body: `
        <div class="container-fluid">
            <div class="row mb-3">
                <textarea class="form-control" id="wb--comments" rows="3" placeholder="Put your comments here"></textarea>
            </div>
        </div>
    `,
    buttons: [
        (() => {
            const button = new CustomBootstrap.Button({
                content: 'Save',
                classes: ['btn-success']
            });

            button.on('click', async() => {
                // if no comment, don't save
                if (!wb_commentModal.el.querySelector('#wb--comments').value) return;
    
                await requestFromServer({
                    url: '/match-strategy/save-comment',
                    body: {
                        eventKey: currentEvent.info.key,
                        compLevel: wb_currentInfo.parameters.compLevel,
                        matchNumber: wb_currentInfo.parameters.matchNumber,
                        comment: wb_commentModal.el.querySelector('#wb--comments').value
                    }
                });
                wb_commentModal.el.querySelector('#wb--comments').value = '';
                wb_commentModal.hide();
            });

            return button;
        })(),
        (() => {
            const button = new CustomBootstrap.Button({
                content: 'Close',
                classes: ['btn-secondary']
            });

            button.on('click', () => {
                wb_commentModal.hide();
            });

            return button;
        })()
    ]
});

// set listener to show modal
document.querySelector('#wb--comments').addEventListener('click', wb_commentModal.show.bind(wb_commentModal));

/**
 * The current whiteboard
 * @type {Whiteboard}
 */
let wb_currentWhiteboard = null;
const wb_penDot = new Point(.9, .1, 0);
mainFunctions.Whiteboard = async({
    parameters
}) => {
    const match = parameters.currentMatch;

    // sets the field
    // currentPage.querySelector('#wb--field-view').src = `../static/pictures/${currentEvent.info.year}/field.png`;
    
    await currentEvent.field.render();
    currentPage.querySelector('img#wb--field-view').src = currentEvent.field.toDataURL();

    // currentPage.querySelector('#wb--field-container').appendChild(currentEvent.field.);

    wb_selectMatch.off('change');

    // function to populate the whiteboard and comments with the respective data
    const getWhiteboard = async(match) => {
        const { 
            whiteboard, 
            comments,
            strategy 
        } = await requestFromServer({
            url: '/match-strategy/get-whiteboard',
            body: {
                eventKey: currentEvent.info.key,
                compLevel: match.compLevel,
                matchNumber: match.matchNumber
            }
        });

        if (whiteboard && Object.keys(whiteboard).length) {
            // if this breaks, it's because there is no whiteboard saved
            try {
                const {
                    states,
                    currentIndex
                } = JSON.parse(whiteboard);
                wb.stack.set(states, currentIndex);
            } catch {}
        } else console.log('No whiteboard saved');

        if (comments) {
            wb_commentModal.el.querySelector('textarea').value = comments;
            wb_currentInfo.write('comments', comments.replace(/\n/g, '<br>'));
        } else {
            wb_commentModal.el.querySelector('textarea').value = '';
            wb_currentInfo.write('comments', 'No Comments');
        }

        wb_currentInfo.write('compLevel', match.compLevel);
        wb_currentInfo.write('matchNumber', match.matchNumber);
        wb_selectMatch.select(`${match.compLevel}-${match.matchNumber}`, false);
        wb.setMatch(match);

        if (whiteboard) wb.load(whiteboard);


        if (strategy) {
            // set strategy info

            const { red, blue } = strategy;

            const buildList = (list, title) => {
                const listTitle = document.createElement('li');
                listTitle.innerHTML = `<strong>${title}</strong>`;
                const listEl = document.createElement('ul');
                listTitle.appendChild(listEl);

                listEl.innerHTML = Array.isArray(list) ? list.map(g => `<li>${g}</li>`).join('') : `<li>${list}</li>`;
                return listTitle;
            }
            

            const globalList = document.createElement('ul');
            [red, blue].forEach((s, i) => {
                if (!s) return;
                const li = document.createElement('li');
                li.innerHTML = `<strong>${i ? 'Blue' : 'Red'} Alliance Strategy</strong>`;

                const { global, robots } = s;

                const list = buildList(global, 'Global Strategy');
                robots.forEach((r, j) => {
                    const team = match.teams[j + (i * 3)].number;
                    list.appendChild(buildList(r, 'Robot Strategy - ' + team));
                });

                li.appendChild(list);

                globalList.appendChild(li);
            });

            wb_currentInfo.write('strategy', globalList);
        }
    };
    
    // reset match select
    wb_selectMatch.clearOptions();
    wb_selectMatch.addOption('Select Match', 'select', true);
    wb_selectMatch.disableOption('select');
    currentEvent.matches.forEach(m => {
        // const isIn = (() => {
        //     return m.alliances.red.teamKeys.includes('frc2122') ? 'danger' : m.alliances.blue.teamKeys.includes('frc2122') ? 'primary' : null;
        // })();
        const isIn = m.hasTeam(2122);
        const classes = [`text-${isIn && m.alliance(2122) == 'red' ? 'danger' : 'primary'}`, `bg-dark`]
        const option = wb_selectMatch.addOption(`${m.compLevel}-${m.matchNumber}`, `${m.compLevel}-${m.matchNumber}`, false, m);

        if (isIn) option.el.classList.add(...classes);
    });

    wb_selectMatch.on('change', () => {
        if (!wb_selectMatch.value) return;
        const match = wb_selectMatch.value.properties;
        wb.canvas.clear();
        getWhiteboard(match);
    });

    // runs when you enter
    const wb = new Whiteboard(document.querySelector('#wb--whiteboard'));
    wb_currentWhiteboard = wb;
    if (match) {
        getWhiteboard(match);
    } else {
        wb_commentModal.el.querySelector('textarea').value = '';
    }

    // TODO: Do I want these to be keydown?
    const save = () => {
        wb.save(
            currentEvent.info.key,
            wb_selectMatch.value.properties.compLevel,
            wb_selectMatch.value.properties.matchNumber
        );
    };
    const prev = wb.canvas.stack.prev.bind(wb.canvas.stack);
    const next = wb.canvas.stack.next.bind(wb.canvas.stack);
    const clear = () => {
        wb.canvas.clear();
        wb.canvas.draw();
        wb.canvas.addState();
    }

    // keybinds
    const keydown = (e) => {
        try {
            if (e.ctrlKey) {
                switch (e.key) {
                    case 'z':
                        e.preventDefault();
                        prev();
                        break;
                    case 'y':
                        e.preventDefault();
                        next();
                        break;
                    case 's':
                        e.preventDefault();
                        save();
                        break;
                    case 'x':
                        e.preventDefault();
                        clear();
                        break;
                }
            }
        } catch {}
    }

    // currentPage.addEventListener('keydown', keydown);

    currentPage.querySelector('#wb--undo').addEventListener('click', prev);
    currentPage.querySelector('#wb--redo').addEventListener('click', next);
    currentPage.querySelector('#wb--save').addEventListener('click', save);
    currentPage.querySelector('#wb--clear').addEventListener('click', clear);


    window.addEventListener('resize', wb.resize.bind(wb));

    // view pen thickness on the whiteboard
    // TODO: this is a bit clunky, but it works
    const drawPenDot = (e) => {
        wb.canvas.context.clearRect(
            wb_penDot.x * wb.canvas.width - 10,
            wb_penDot.y * wb.canvas.height - 10,
            20,
            20
        );
        const { value } = e.target;
        wb_penDot.radius = +value;
        wb.penThickness = +value;
        wb_penDot.draw(wb.canvas);

        setTimeout(() => {
            wb.canvas.context.clearRect(
                wb_penDot.x * wb.canvas.width - 10,
                wb_penDot.y * wb.canvas.height - 10,
                20,
                20
            );
        }, 1000);
    }

    currentPage.querySelector('#wb--pen-width').addEventListener('input', drawPenDot);

    const customButtons = currentPage.querySelector('#wb--custom-buttons');
    const btnGroup = new CustomBootstrap.ButtonGroup(customButtons);
    btnGroup.addButton(
        // ...wb_customButtons[currentEvent.info.year],
        new CustomBootstrap.Button({
            content: '<i class="material-icons">palette</i>',
            classes: ['btn-dark'],
            onclick: () => {
                wb.currentRobot = wb.blackRobot;
            }
        }));

    currentPage.clearParameters();

    return async() => {
        // runs when you leave
        window.removeEventListener('resize', wb.resize.bind(wb));

        // currentPage.removeEventListener('keydown', keydown);
        currentPage.querySelector('#wb--undo').removeEventListener('click', prev);
        currentPage.querySelector('#wb--redo').removeEventListener('click', next);
        currentPage.querySelector('#wb--save').removeEventListener('click', save);
        currentPage.querySelector('#wb--clear').removeEventListener('click', clear);

        wb.canvas.destroy();
        wb_selectMatch.off('change');

        wb_commentModal.write('comments', 'You have not selected a match yet');
        wb_commentModal.hide();
    }
}