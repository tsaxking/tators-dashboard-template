'use strict';
let currentPage;
const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

const week = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

const interactEvents = [
    'mouseover',
    'mousemove',
    'click',
    'dblclick',
    'mousedown',
    'mouseup',
    'mousewheel',
    'mouseout',
    'contextmenu',
    'keydown',
    'keypress',
    'keyup',
    'touchstart',
    'touchend',
    'touchmove',
    'touchcancel'
];

const manualEvents = [
    'click',
    'dblclick',
    'mousedown',
    'mouseup',
    'contextmenu',
    'keydown',
    'keypress',
    'keyup',
    'touchstart',
    'touchend',
    'touchcancel'
];

/**
 * A version of .flat() that uses spread syntax so that it
 * still works for typescript
 * @param {Any[]} array A multi-dimensional array that you want to turn into a 1 dimensional array
 * @param {number} depth How many times to recurse through the array  
 */
function flatten(array, depth = 1) {
    // This is a separate array because you can't return spreaded items to a map function
    const flattenedArray = [];
    array.forEach(el => {
        // Checking if the element of the array is an array
        // If it is we will either flatten that array and spread it or just spread it
        // this depends whether the depth is one or not since if it is one you would be flattening the next array
        // with a depth of zero which isn't flattening it
        if (Array.isArray(el)) {
            if (depth == 1) {
                flattenedArray.push(...el);
            } else {
                // Decreasing the depth by 1 because that will make it so that 
                // it will stop recursing once it reaches the desire depth

                // in Javascript Infinity - 1 is still Infinity so if you put Infinity 
                // it will recurse until Array.isArray(el) becomes false for every el 
                // or until you reach max call stack size
                flattenedArray.push(...flatten(el, depth - 1));
            }
        } else {
            flattenedArray.push(el);
        }
    });

    return flattenedArray;
}

// ▄▀▄ █▀▄ █▀▄ ▄▀▄ ▀▄▀    █▀ █ █ █▄ █ ▄▀▀ ▀█▀ █ ▄▀▄ █▄ █ ▄▀▀ 
// █▀█ █▀▄ █▀▄ █▀█  █     █▀ ▀▄█ █ ▀█ ▀▄▄  █  █ ▀▄▀ █ ▀█ ▄█▀ 

/**
 * @description Creates an array function currier that can take in a function then output a function that applies the function to an array  
 * @type {func}
 * @param {string} name The name of the array function (reduce, map, forEach etc)
 * @return {(fn: func, ...otherArgs: any) => (arr: Array) => (Array || void)}
 */
const curryArrayFunction = name => (fn, ...otherArgs) => arr => {
    if (!arr) console.error(`the parameter arr passed into `, fn, ` isn't defined: `, arr);
    if (!Array.isArray(arr)) console.error(`the parameter arr passed into `, fn, ` isn't an array: `, arr);

    return arr[name](fn, ...otherArgs)
};
/**
 * @description Creates a new function that will reduce an array and return the result
 * @type {func}
 * @param {func} fn A function that you would normally put inside arr.reduce(fn).
 * @return {(arr: Array) => any}
 */
const reduce = curryArrayFunction("reduce");

/**
 * @description Creates a new function that will filter an array and return the resulting array
 * @type {func}
 * @param {function} fn A function that you would normally put inside arr.filter(fn).
 * @return {(arr: Array) => any}
 */
const filter = curryArrayFunction("filter");
/**
 * @description Creates a new function that will run on every item of an array
 * @type {func} 
 * @param {func} fn A function that you would normally put inside arr.forEach(fn).
 * @return {(arr: Array) => any}
 */
const forEach = curryArrayFunction("forEach");
/**
 * @description Creates a new function that will run a function on every item of an array and return the result
 * @type {func} 
 * @param {func} fn A function that you would normally put inside arr.map(fn).
 * @return {(arr: Array) => any[]}
 */
const map = curryArrayFunction("map");
/**
 * @description Creates a new function that will run a function on every item of an array and use the return value to sort a function returns the array
 * @type {func} 
 * @param {func} fn A function that you would normally put inside arr.sort(fn).
 * @return {(arr: Array) => any[]}
 */
const sort = curryArrayFunction("sort");

/**
 * Sorts an array from low to high
 * @type {func}
 * @param {number[]} arr The array you want to sort
 * @returns {number[]}
 */
const ascendingSort = sort((a, b) => a - b);
/**
 * Sorts an array from high to low
 * @type {func}
 * @param {number[]} arr The array you want to sort
 * @returns {number[]}
 */
const descendingSort = sort((a, b) => b - a);
/**
 * Sorts an array from high to low based off of a property of an array and a direction
 * @type {func} 
 * @param {string} property
 * @returns {(ascending: boolean) => (arr: number[]) => number[]}
 */
const sortProperty = property => ascending => sort((a, b) => ascending ? a[property] - b[property] : b[property] - a[property]);
/**
 * Performs a function on every member of an array then sorts them in ascending or descending order
 * @param {function} fn The function to perform on each array item
 * @returns {(ascending: boolean) => (arr: any[]) => any[]}
 */
const sortFunctionOutputs = fn => ascending => sort((a, b) => {
    const aValue = fn(a);
    const bValue = fn(b);

    const aNaN = isNaN(aValue);
    const bNaN = isNaN(bValue);
    if (aNaN || bNaN) {
        return +aNaN - bNaN;
    };

    // if (isNaN(aValue) || isNaN(bValue)) console.error("While sorting function: ", fn, " returned a NaN value: ", aValue, bValue);
    return ascending ? aValue - bValue : bValue - aValue;
});

const sum = reduce((a, b) => a + b, 0);
const average = arr => sum(arr) / arr.length;

/**
 * Is a curried event listener that takes in an event and a function and then is able to add an event listener for that event and function to a node
 * @param {string} event The type of event. Ex. "click" or "resize" 
 * @returns {(func: function, ...args) => (node: Node) => void}
 */
const curryEventListener = event => (func, ...args) => node => {
    typeof event == "string" || console.error("event is not a string: ", event);
    typeof func == "function" || console.error("func is not a function: ", func);
    node instanceof Node || console.error("node is not a class Node: ", node)
    node.addEventListener(event, func, ...args);
}

const eventListenerClick = curryEventListener("click");
const eventListenerChange = curryEventListener("change");

/**
 * @description takes in an array of properties and and object then uses a recursive to return obj.property1.property2 etc if properties is [property1, property2],
 * @example
 * const obj = { a: { b: "foo" } };
 * console.log(getProperties()(["a", "b"])(obj)) // logs foo
 * @type {func} 
 * @param {func} then a callback function that this will call after getting the property
 * @returns {(properties: String[]) => (obj) => any}
 */
const getProperties = then => properties => obj => {
    // console.log("input: ", properties, obj);

    // Gets the first property out of the property path
    const [property] = properties;
    // Gets the objs property and sets it to the new obj
    const newObj = obj[property];
    // removes the first property from properties without editing any dependencies
    const newProperties = properties.slice(1);

    // console.log("output: ", newProperties, newObj);

    // If there are still more properties it recurses,
    // Otherwise it will either run a callback function or return the new object
    return newProperties.length ? getProperties(then)(newProperties)(newObj) : then ? then(newObj) : newObj;
};

// const sumProperties = properties => {
//     // Creating a partial of getProperties that will get the properties that were passed into this function
//     const getGivenProperties = getProperties()(properties.split("."));
//     return reduce((a, b) => a + (getGivenProperties(b) || 0), 0);
// }; 
// const averageProperties = properties => {
//     // Creating a partial of sumProperties that will sum the properties that were passed into this function
//     const sumGivenProperties = sumProperties(properties);
//     return array => sumGivenProperties(array)/array.length;
// };

/**
 * @description Runs a function on each member of an array then sums them
 * @type {func}
 * @param {func} func the function to run on each array item
 * @returns {(arr: Array) => any}
 */
const sumFunction = func => reduce((a, b) => a + func(b), 0);
/**
 * @description Runs a function on each member of an array then averages them
 * @type {func}
 * @param {func} func the function to run on each array item
 * @returns {(arr: Array) => any}
 */
const averageFunction = func => {
    // Creates a function that will add up everything
    const partialSum = sumFunction(func);

    return arr => partialSum(arr) / arr.length;
}

const combineWithDashes = reduce((a, b) => a + "-" + b);

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


// You have to do this here because global.js runs after 2023.js so the sumFunction doesn't exist till now
// FIRSTYear[2023].totalTeamScores = map(FIRSTYear[2023].totalScore);

/**
 * 
 * @param {Array} matches matches array pulled from database OR thebluealliance API 
 * @returns {Array} sorted array starting with qm1 and ending with finals
 */
function sortMatches(matches) {
    const sortArr = [
        'qm',
        'qf',
        'sf',
        'f'
    ];

    return matches.sort((a, b) => a.number - b.number).sort((a, b) => {
        const aIndex = sortArr.indexOf(a.compLevel || a.comp_level);
        const bIndex = sortArr.indexOf(b.compLevel || b.comp_level);

        if (aIndex > bIndex) {
            return 1;
        } else if (aIndex < bIndex) {
            return -1;
        } else {
            return 0;
        }
    });
}

function filterTatorMatches(matches) {
    return matches.filter((match) => {
        const {
            alliances
        } = match;

        if (alliances.red.teamKeys.includes('frc2122') || alliances.blue.teamKeys.includes('frc2122')) {
            return true;
        } else return false;
    });
}

/**
 * 
 * @param {Date} date Target date object
 * @param {HTMLElement} element Target element to append the date to
 * @param {String} endMessage (OPTIONAL) Message to append to the end of the date
 * @returns {Object} Interval object
 */
function countdownToDate(date, element, endMessage) {
    // set interval to update the countdown
    let cdInterval = setInterval(() => {
        const now = new Date();
        const diff = date - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        element.innerHTML = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;

        if (diff < 0) {
            clearInterval(cdInterval);
            element.innerHTML = endMessage ? endMessage : 'Countdown finished';
        }
    }, 1000);

    return cdInterval;
}

function convertDateStrToObj(str) {
    // input is "2022-08-22"
    const dateArr = str.split('-');
    return new Date(dateArr[0], dateArr[1] - 1, dateArr[2]);
}


const sleep = async(n) => {
    // sleep for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000 * n));
    return 'done';
};

const camelCaseToNormalCasing = (str) => str.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

function upperCaseFirstLetter(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

const convertObjToCamelCase = (obj) => {
    try {
        JSON.stringify(obj);
    } catch {
        console.error('Cannot convert to camel case due to circular reference');
        return obj;
    }

    // convert json string to camel case using regex
    // only convert keys
    // if value is object, convert recursively

    if (Array.isArray(obj)) return obj.map(convertObjToCamelCase);

    if (typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            if (typeof obj[key] === 'object') {
                newObj[convertObjToCamelCase(key)] = convertObjToCamelCase(obj[key]);
            } else {
                newObj[convertObjToCamelCase(key)] = obj[key];
            }
        }
        return newObj;
    } else {
        return obj.replace(/(_[a-z])/g, (match) => {
            return match[1].toUpperCase();
        });
    }
}

/**
 * 
 * @param {String} binaryString Binary string to turn into number
 * @returns {Number} Number the binary string represents
 */
const toDec = (binaryString) => {
    if (isNaN(binaryString)) throw new Error('Binary string must be a number, received: ' + typeof binaryString);
    return parseInt(binaryString, 2);
}

/**
 * 
 * @param {Number} number number to turn into binary
 * @returns {String} Binary String
 */
const toBin = (number) => {
    if (typeof number !== 'number') throw new Error('Number must be a number, received: ' + typeof number);
    return number.toString(2);
}

const blankArray = length => new Array(length).fill();

const mainFunctions = {};

window.isMobile =
    (function(a) {
        return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)));
    })(navigator.userAgent || navigator.vendor || window.opera);

// Chart.register(BoxPlotController, BoxAndWhiskers, LinearScale, CategoryScale);