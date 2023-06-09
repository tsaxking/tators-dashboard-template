function showElement(el) {
    el.classList.remove('d-none');
    // el.classList.add('d-block');
}

function hideElement(el) {
    // el.classList.remove('d-block');
    el.classList.add('d-none');
}

function isHidden(el) {
    return el.classList.contains('d-none');
}

function cloak(el) {
    el.classList.add('invisible');
    el.classList.remove('visible');
}

function deCloak(el) {
    el.classList.remove('invisible');
    el.classList.add('visible');
}

// Turns html string into html object
function createElementFromText(str) {
    let div = document.createElement('div');
    div.innerHTML = str;
    return div.children[0];
}

function addAlpha(color, opacity) {
    // coerce values so ti is between 0 and 1.
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
}

function hexToRgbA(hex, opacity) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + `${opacity ? opacity : 1})`;
    }
    throw new Error('Bad Hex');
}

function randomHex() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function randomRGB(opacity) {
    var o = Math.round,
        r = Math.random,
        s = 255;
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + (opacity ? opacity : 1) + ')';
}

function changeRGBAOpacity(color, opacity) {
    if (typeof opacity != 'number') throw new Error('Type of opacity is not a number, type is: ' + typeof opacity);
    if (opacity < 0 || opacity > 1) throw new Error('Opacity is not between 0 and 1, value is: ' + opacity);

    let colorArr = color.split(',');
    colorArr[3] = opacity + ')';
    return colorArr.join(',');
}

function detectRGBContrast(colors) {
    const threshold = ((256 + 256 + 256) / colors.length) > 50 ? 50 : ((256 + 256 + 256) / colors.length);
    return colors.some((color, index, array) => {
        const [r, g, b] = color;
        let test = array.filter((testColor, testIndex) => {
            if (testIndex === index) return false;

            const [testR, testG, testB] = testColor;

            let rDist = Math.abs(testR - r);
            let gDist = Math.abs(testB - b);
            let bDist = Math.abs(testG - g);

            let close = (rDist + gDist + bDist) < threshold;

            return close;
        });
        return test.length != 0;
    });
}

function getUniqueRGB(colors) {
    if (colors.length == 0) return randomRGB();
    let color, _colors;
    do {
        color = randomRGB();
        let [r, g, b] = color.split(',');

        r = r.slice(5, r.length);

        _colors = colors.map(c => {
            let [_r, _g, _b] = c.split(',');

            _r = _r.slice(5, _r.length);
            return [Number(_r), Number(_g), Number(_b)];
        });

        _colors.push([
            Number(r),
            Number(g),
            Number(b)
        ]);
    } while (detectRGBContrast(_colors));

    return color;
}

/**
 * 
 * @param {String} rgb1 rgb color in format 'rgb(r,g,b)' or rgba(r,g,b,a)
 * @param {String} rgb2 rgb color in format 'rgb(r,g,b)' or rgba(r,g,b,a)
 * @param {String} distance distance in pixels between rgb1 and rgb2 (length of the array returned - 2)
 * @returns {Array} of rgb values between rgb1 and rgb2 (inclusive)
 */
function fadeColors(rgb1, rgb2, distance) {
    // rgb1 and rgb2 are strings of 'rgb(r,g,b)' or 'rgba(r,g,b,a)'
    // distance is a number of pixels

    let [r1, g1, b1, a1] = rgb1.replace('rgb(', '').replace('rgba(', '').replace(')', '').split(',');
    let [r2, g2, b2, a2] = rgb2.replace('rgb(', '').replace('rgba(', '').replace(')', '').split(',');

    a1 = a1 ? parseFloat(a1) : 1;
    a2 = a2 ? parseFloat(a2) : 1;

    const arr = new Array(distance);

    const rD = (r2 - r1) / distance;
    const gD = (g2 - g1) / distance;
    const bD = (b2 - b1) / distance;
    const aD = (a2 - a1) / distance;

    for (let i = 0; i < distance; i++) {
        const r = Math.round(+r1 + rD * i);
        const g = Math.round(+g1 + gD * i);
        const b = Math.round(+b1 + bD * i);
        const a = Math.round((+a1 + aD * i) * 100) / 100;

        arr[i] = `rgba(${r},${g},${b},${a})`;
    }

    arr.unshift(rgb1);
    arr.push(rgb2);

    return arr;
}

function createElementFromSelector(selector) {
    var pattern = /^(.*?)(?:#(.*?))?(?:\.(.*?))?(?:@(.*?)(?:=(.*?))?)?$/;
    var matches = selector.match(pattern);
    var element = document.createElement(matches[1] || 'div');
    if (matches[2]) element.id = matches[2];
    if (matches[3]) {
        matches[3].split('.').forEach(c => {
            element.classList.add(c);
        });
    }
    if (matches[4]) element.setAttribute(matches[4], matches[5] || '');
    return element;
}


function createCheckbox(id, value, classList, name, checked, func) {
    let formCheck = document.createElement('div');
    formCheck.classList.add('form-check');
    formCheck.classList.add('ws-nowrap');

    let input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    input.value = value;
    input.id = id;
    if (classList) classList.forEach(c => {
        input.classList.add(c);
    });

    input.checked = checked;

    if (func) input.addEventListener('change', func);


    formCheck.appendChild(input);

    if (name) {
        let label = document.createElement('label');
        label.classList.add('form-check-label');
        label.classList.add('ps-2');
        label.innerText = name;
        formCheck.appendChild(label);
    }

    return formCheck;
}

/*
    [
        {
            title: 'Title',
            items: [
                {
                    title: 'Item',
                    func: () => {
                        // do something
                    }
                }
            ]
        }
    ]
*/



/**
 * 
 * @param {HTMLElement} el HTML element
 * @param {Array} sections Array of objects with title/name and items
 * @param {Object} options Options object
 * 
 * @example
 * ```
 * createContextMenu(document.getElementById('myElement'), [
 *  {
 *     title: 'Title',
 *     items: [
 *       {
 *          title: 'Item',
 *         action: () => {
 *           // do something
 *        }
 *    }
 * ], {
 *   ignoreFrom: ['input', 'textarea'], // css selectors
 *   touchHold: {
 *    time: 500, // ms
 *    allowAttribute: 'data-touch-allow', // attribute to create context menu on touch hold. Use when you don't want a contextmenu to appear, ie. dragging (default: data-touch-allow)
 *    parentTest: false // if true, will test parent elements for allowAttribute (default: false)
 *   }
 * });
 * ```
 */
// function createContextMenu(el, sections, options) {
//     // remove previous event listeners?

//     let ignoreFrom,
//         touchHold = {
//             time: 500,
//             allowAttribute: 'data-touch-allow',
//             parentTest: false
//         };
//     if (options) {
//         ignoreFrom = options.ignoreFrom;
//         touchHold = {...touchHold, ...options.touchHold };
//     }

//     const createSections = (e) => {
//         let ignoreEls = [];
//         if (Array.isArray(ignoreFrom)) {
//             ignoreFrom.forEach(i => {
//                 el.querySelectorAll(i).forEach(_e => {
//                     ignoreEls.push(_e);
//                 });
//             });
//             // return if the element is in the ignore list or is a child of one of the ignore list elements.
//             if (ignoreEls.some(i => i.contains(e.target))) {
//                 // console.log('Ignoring right click');
//                 return;
//             }
//         }

//         e.preventDefault();
//         const contextmenuContainer = document.querySelector('#contextmenu-container');

//         const menu = document.querySelector('#contextmenu');
//         menu.innerHTML = '';

//         sections.forEach(section => {
//             const { name, items } = section;
//             let { title } = section;

//             if (!title) title = name;
//             // const sectionEl = document.createElement('li');
//             const sectionTitle = createElementFromSelector('p.ws-nowrap.bg-dark.text-secondary.p-1.rounded.m-0.no-select');
//             sectionTitle.innerHTML = title;
//             // sectionEl.appendChild(sectionTitle);
//             menu.appendChild(sectionTitle);

//             // const sectionDivider = document.createElement('li');
//             const sectionDividerEl = createElementFromSelector('hr.dropdown-divider.bg-light.m-0');
//             // sectionDivider.appendChild(sectionDividerEl);
//             menu.appendChild(sectionDividerEl);

//             items.forEach(item => {
//                 const { name, action, func, color } = item;
//                 let { title } = item;
//                 if (!title) title = name;
//                 // const itemEl = document.createElement('li');
//                 const itemElLink = createElementFromSelector('p.ws-nowrap.cursor-pointer.bg-dark.text-light.m-0.p-1.rounded');

//                 itemElLink.addEventListener('mouseover', () => {
//                     itemElLink.classList.remove('bg-dark');
//                     itemElLink.classList.add(`bg-${color ? color : 'primary'}`);
//                 });
//                 itemElLink.addEventListener('mouseout', () => {
//                     itemElLink.classList.remove(`bg-${color ? color : 'primary'}`);
//                     itemElLink.classList.add('bg-dark');
//                 });

//                 itemElLink.innerHTML = title;
//                 if (action) {
//                     itemElLink.addEventListener('click', action);
//                 } else if (func) {
//                     itemElLink.addEventListener('click', func);
//                 }
//                 // itemEl.appendChild(itemElLink);
//                 menu.appendChild(itemElLink);
//             });
//         });

//         const { clientX: mouseX, clientY: mouseY } = e;
//         contextmenuContainer.style.left = mouseX + 'px';
//         contextmenuContainer.style.top = mouseY + 'px';
//         showElement(contextmenuContainer);

//         const removeMenu = (evt) => {
//             if (evt.target == el) return;
//             hideElement(contextmenuContainer);
//             menu.innerHTML = '';
//             document.removeEventListener('click', removeMenu);
//             // document.removeEventListener('contextmenu', removeMenu);
//         }

//         document.addEventListener('click', removeMenu);
//         // document.addEventListener('contextmenu', removeMenu);
//     }

//     el.removeEventListener('contextmenu', createSections);
//     el.addEventListener('contextmenu', createSections);
//     el.addEventListener('touchstart', (e) => {
//         let runFunction = true;
//         e.preventDefault();
//         e.clientX = e.touches[0].clientX;
//         e.clientY = e.touches[0].clientY;

//         const touchEnd = (e) => {
//             runFunction = false;
//             el.removeEventListener('touchend', touchEnd);
//             clearTimeout(timeout);
//         }

//         el.addEventListener('touchend', touchEnd);

//         console.log(touchHold);

//         let timeout = setTimeout(() => {
//             if (runFunction) {
//                 let allow = false;
//                 if (touchHold.parentTest) {
//                     getAllParentElements(e.target).forEach(p => {
//                         if (p.getAttribute(touchHold.allowAttribute)) allow = true;
//                     });
//                 } else {
//                     if (e.target.getAttribute(touchHold.allowAttribute)) allow = true;
//                 }
//                 if (allow) createSections(e);
//             }
//             el.removeEventListener('touchend', touchEnd);
//         }, touchHold.time);
//     });
// }

function createContextMenu(el, sections, options = {
    ignoreFrom: [],
    touchMenu: true
}) {
    // remove previous event listeners

    const { ignoreFrom, touchMenu } = options;

    const createSections = (e) => {
        let ignoreEls = [];
        if (Array.isArray(ignoreFrom)) {
            ignoreFrom.forEach(i => {
                el.querySelectorAll(i).forEach(_e => {
                    ignoreEls.push(_e);
                });
            });
            // return if the element is in the ignore list or is a child of one of the ignore list elements.
            if (ignoreEls.some(i => i.contains(e.target))) {
                // console.log('Ignoring right click');
                return;
            }
        }

        e.preventDefault();
        const contextmenuContainer = document.querySelector('#contextmenu-container');

        const menu = document.querySelector('#contextmenu');
        menu.innerHTML = '';

        sections.forEach(section => {
            const { name, items } = section;
            let { title } = section;

            if (!title) title = name;
            // const sectionEl = document.createElement('li');
            const sectionTitle = createElementFromSelector('p.ws-nowrap.bg-dark.text-secondary.p-1.rounded.m-0.no-select');
            sectionTitle.innerHTML = title;
            // sectionEl.appendChild(sectionTitle);
            menu.appendChild(sectionTitle);

            // const sectionDivider = document.createElement('li');
            const sectionDividerEl = createElementFromSelector('hr.dropdown-divider.bg-light.m-0');
            // sectionDivider.appendChild(sectionDividerEl);
            menu.appendChild(sectionDividerEl);

            items.forEach(item => {
                const { name, action, func, color } = item;
                let { title } = item;
                if (!title) title = name;
                // const itemEl = document.createElement('li');
                const itemElLink = createElementFromSelector('p.ws-nowrap.cursor-pointer.bg-dark.text-light.m-0.p-1.rounded');

                itemElLink.addEventListener('mouseover', () => {
                    itemElLink.classList.remove('bg-dark');
                    itemElLink.classList.add(`bg-${color ? color : 'primary'}`);
                });
                itemElLink.addEventListener('mouseout', () => {
                    itemElLink.classList.remove(`bg-${color ? color : 'primary'}`);
                    itemElLink.classList.add('bg-dark');
                });

                itemElLink.innerHTML = title;
                if (action) {
                    itemElLink.addEventListener('click', action);
                } else if (func) {
                    itemElLink.addEventListener('click', func);
                }
                // itemEl.appendChild(itemElLink);
                menu.appendChild(itemElLink);
            });
        });

        if (e.type == 'touchstart') {
            e = {
                clientX: e.touches[0].clientX,
                clientY: e.touches[0].clientY
            }
        }

        const {
            clientX: mouseX,
            clientY: mouseY
        } = e;
        contextmenuContainer.style.left = mouseX + 'px';
        contextmenuContainer.style.top = mouseY + 'px';
        showElement(contextmenuContainer);

        const removeMenu = (evt) => {
            if (evt.target == el) return;
            hideElement(contextmenuContainer);
            menu.innerHTML = '';
            document.removeEventListener('click', removeMenu);
            // document.removeEventListener('contextmenu', removeMenu);
        }

        document.addEventListener('click', removeMenu);
        // document.addEventListener('contextmenu', removeMenu);
    }

    el.removeEventListener('contextmenu', createSections);
    el.addEventListener('contextmenu', createSections);

    if (touchMenu) {
        let touching = false;
        const waitForTouch = (e) => {
            e.preventDefault();
            // if touch is held for .5 seconds
            touching = true;

            setTimeout(() => {
                if (touching) {
                    createSections(e);
                    touching = false;
                }
            }, 500);
        }

        const stopTouch = (e) => {
            e.preventDefault();
            touching = false;
        }

        el.removeEventListener('touchstart', waitForTouch);
        el.removeEventListener('touchend', stopTouch);

        el.addEventListener('touchstart', waitForTouch);
        el.addEventListener('touchend', stopTouch);


    }
}

function getAllParentElements(el) {
    let parents = [];
    let parent = el.parentElement;
    while (parent) {
        parents.push(parent);
        parent = parent.parentElement;
    }
    return parents;
}