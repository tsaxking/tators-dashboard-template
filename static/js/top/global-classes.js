// convert snake case to camel case
const convertToCamelCase = (obj) => {
    try {
        JSON.stringify(obj);
    } catch {
        console.error('Cannot convert to camel case due to circular reference');
        return obj;
    }

    // convert json string to camel case using regex
    // only convert keys
    // if value is object, convert recursively

    if (Array.isArray(obj)) return obj.map((item) => convertToCamelCase(item));

    if (typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            if (typeof obj[key] === 'object') {
                newObj[convertToCamelCase(key)] = convertToCamelCase(obj[key]);
            } else {
                newObj[convertToCamelCase(key)] = obj[key];
            }
        }
        return newObj;
    } else {
        if (typeof obj == "number" || obj === undefined) return;
        return obj.replace(/(_[a-z])/g, (match) => {
            return match[1].toUpperCase();
        });
    }
}

const getXY = (e) => {
    if (e.touches) {
        return {
            x: e.touches[0] ? e.touches[0].clientX : null,
            y: e.touches[0] ? e.touches[0].clientY : null
        }
    } else {
        return {
            x: e.clientX,
            y: e.clientY
        }
    }
}