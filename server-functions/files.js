"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.LogType = exports.openAllInFolder = exports.openAllInFolderSync = exports.fileStream = exports.formatBytes = exports.deleteUpload = exports.getUpload = exports.uploadMultipleFiles = exports.saveUpload = exports.saveTemplate = exports.saveTemplateSync = exports.getTemplate = exports.getTemplateSync = exports.saveJSON = exports.saveJSONSync = exports.getJSON = exports.getJSONSync = void 0;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var uuid_1 = require("uuid");
var node_html_parser_1 = require("node-html-parser");
var v3_1 = require("node-html-constructor/versions/v3");
var callsite_1 = __importDefault(require("callsite"));
var worker_threads_1 = require("worker_threads");
var objects_to_csv_1 = __importDefault(require("objects-to-csv"));
// console.log(build);
/**
 * Description placeholder
 *
 * @type {*}
 */
var env = process.argv[2] || 'dev';
/**
 * Gets a json from the jsons folder
 *
 * @export
 * @param {string} file the file name with no extension (ex '/accounts')
 * @returns {*} false if there is an error, otherwise the json
 *
 * @example
 * ```javascript
 * const accounts = getJSON('/accounts');
 * ```
 *
 *
 */
function getJSONSync(file) {
    var p = file;
    if (!file.includes('.json'))
        file += '.json';
    if (!(file.startsWith('.')))
        p = path.resolve('./jsons', file);
    else {
        var stack = (0, callsite_1.default)(), requester = stack[1].getFileName(), requesterDir = path.dirname(requester);
        p = path.resolve(requesterDir, p);
    }
    p = path.resolve(__dirname, p);
    if (!fs.existsSync(p)) {
        console.error('Error reading JSON file: ' + p, 'file does not exist. Input: ', file);
        return false;
    }
    var content = fs.readFileSync(p, 'utf8');
    // remove all /* */ comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    // remove all // comments
    content = content.replace(/\/\/ .*/g, '');
    try {
        return JSON.parse(content);
    }
    catch (e) {
        console.error('Error parsing JSON file: ' + file, e);
        return false;
    }
}
exports.getJSONSync = getJSONSync;
;
/**
 * Gets a json from the jsons folder
 *
 * @export
 * @param {string} file the file name with no extension (ex '/accounts')
 * @returns {Promise<any>} false if there is an error, otherwise the json
 *
 * @example
 * ```javascript
 * const accounts = await getJSON('/accounts');
 * ```
 */
function getJSON(file) {
    return new Promise(function (res, rej) {
        var p = file;
        if (!file.includes('.json'))
            file += '.json';
        if (!(file.startsWith('.')))
            p = path.resolve('./jsons', file);
        else {
            var stack = (0, callsite_1.default)(), requester = stack[1].getFileName(), requesterDir = path.dirname(requester);
            p = path.resolve(requesterDir, p);
        }
        p = path.resolve(__dirname, p);
        if (!fs.existsSync(p)) {
            console.error('Error reading JSON file: ' + p, 'file does not exist. Input: ', file);
            return false;
        }
        fs.readFile(p, 'utf8', function (err, content) {
            if (err) {
                console.error('Error reading JSON file: ' + file, err);
                return rej(err);
            }
            // remove all /* */ comments
            content = content.replace(/\/\*[\s\S]*?\*\//g, '');
            // remove all // comments
            content = content.replace(/\/\/ .*/g, '');
            try {
                res(JSON.parse(content));
            }
            catch (e) {
                console.error('Error parsing JSON file: ' + file, e);
                res(false);
            }
        });
    });
}
exports.getJSON = getJSON;
/**
 * Saves a json to the jsons folder
 *
 * @export
 * @param {string} file the file name with no extension (ex '/accounts')
 * @param {*} data the data to save
 * @returns {boolean} whether the file was saved successfully
 * If the file is not saved successfully, it will log the error and return false
 *
 *
 */
function saveJSONSync(file, data) {
    var p = file;
    if (!file.includes('.json'))
        file += '.json';
    if (!(file.startsWith('.')))
        p = path.resolve('./jsons', file);
    else {
        var stack = (0, callsite_1.default)(), requester = stack[1].getFileName(), requesterDir = path.dirname(requester);
        p = path.resolve(requesterDir, p);
    }
    p = path.resolve(__dirname, p);
    try {
        JSON.stringify(data);
    }
    catch (e) {
        console.error('Error stringifying JSON file: ' + file, e);
        return false;
    }
    fs.writeFileSync(p, JSON.stringify(data, null, 4), 'utf8');
    return true;
}
exports.saveJSONSync = saveJSONSync;
/**
 * Saves a json to the jsons folder
 *
 * @export
 * @param {string} file the file name with no extension (ex '/accounts')
 * @param {*} data the data to save
 * @returns {Promise<boolean>} whether the file was saved successfully
 * If the file is not saved successfully, it will log the error and return false
 *
 *
 */
function saveJSON(file, data) {
    return new Promise(function (res, rej) {
        var p = file;
        if (!file.includes('.json'))
            file += '.json';
        if (!(file.startsWith('.')))
            p = path.resolve('./jsons', file);
        else {
            var stack = (0, callsite_1.default)(), requester = stack[1].getFileName(), requesterDir = path.dirname(requester);
            p = path.resolve(requesterDir, p);
        }
        p = path.resolve(__dirname, p);
        try {
            JSON.stringify(data);
        }
        catch (e) {
            console.error('Error stringifying JSON file: ' + file, e);
            return res(false);
        }
        fs.writeFile(p, JSON.stringify(data, null, 4), 'utf8', function (err) {
            if (err)
                return rej(err);
            res(true);
        });
    });
}
exports.saveJSON = saveJSON;
/**
 * Builds for development only (Caches)
 *
 * @type {*}
 */
var builds = (worker_threads_1.workerData === null || worker_threads_1.workerData === void 0 ? void 0 : worker_threads_1.workerData.builds) || {};
var buildJSON = getJSONSync('../build/build.json');
!buildJSON.buildDir.endsWith('/') && (buildJSON.buildDir += '/'); // make sure it ends with a slash 
/**
 * Parses the html and adds the builds
 *
 * @param {string} template
 * @returns {*}
 */
var runBuilds = function (template) {
    var root = (0, node_html_parser_1.parse)(template);
    var insertBefore = function (parent, child, before) {
        parent.childNodes.splice(parent.childNodes.indexOf(before), 0, child);
    };
    switch (env) {
        case 'prod': // production (combine and minify)
            root.querySelectorAll('.developer').forEach(function (d) { return d.remove(); });
            root.querySelectorAll('script').forEach(function (s) {
                if (!s.attributes.src)
                    return;
                var stream = buildJSON.streams[s.attributes.src];
                if (!stream)
                    return;
                var ext = path.extname(s.attributes.src);
                var name = path.basename(s.attributes.src, ext);
                s.setAttribute('src', "".concat(buildJSON.buildDir).concat(buildJSON.minify ? name + '.min' + ext : name + ext));
                stream.files.forEach(function (f) {
                    // console.log(f);
                    // find --ignore-build
                    var regex = /--ignore-build\s*/g;
                    if (!regex.test(f))
                        return;
                    // console.log('Includes ignore build', f);
                    f = f.replace('--ignore-build', '').trim();
                    var script = (0, node_html_parser_1.parse)("<script src=\"".concat(f.replace('[ts]', ''), "\"></script>"));
                    // console.log(script.innerHTML);
                    insertBefore(s.parentNode, script, s);
                });
            });
            root.querySelectorAll('link').forEach(function (l) {
                if (!l.attributes.href)
                    return;
                var stream = buildJSON.streams[l.attributes.href];
                if (!stream)
                    return;
                var ext = path.extname(l.attributes.href);
                var name = path.basename(l.attributes.href, ext);
                l.setAttribute('href', "".concat(buildJSON.buildDir).concat(buildJSON.minify ? name + '.min' + ext : name + ext));
                stream.files.forEach(function (f) {
                    // console.log(f);
                    // find --ignore-build
                    var regex = /--ignore-build\s*/g;
                    if (!regex.test(f))
                        return;
                    // console.log('Includes ignore build', f);
                    f = f.replace('--ignore-build', '').trim();
                    var link = (0, node_html_parser_1.parse)("<link rel=\"stylesheet\" href=\"".concat(f, "\">"));
                    // console.log(link.innerHTML);
                    insertBefore(l.parentNode, link, l);
                });
            });
            break;
        case 'test': // testing (combine but do not minify)
            root.querySelectorAll('.developer').forEach(function (d) { return d.remove(); });
            root.querySelectorAll('script').forEach(function (s) {
                if (!s.attributes.src)
                    return;
                var stream = buildJSON.streams[s.attributes.src];
                if (!stream)
                    return;
                s.setAttribute('src', "".concat(buildJSON.buildDir).concat(s.attributes.src));
                stream.files.forEach(function (f) {
                    // console.log(f);
                    // find --ignore-build
                    var regex = /--ignore-build\s*/g;
                    if (!regex.test(f))
                        return;
                    // console.log('Includes ignore build', f);
                    f = f.replace('--ignore-build', '').trim();
                    var script = (0, node_html_parser_1.parse)("<script src=\"".concat(f.replace('[ts]', ''), "\"></script>"));
                    // console.log(script.innerHTML);
                    insertBefore(s.parentNode, script, s);
                });
            });
            root.querySelectorAll('link').forEach(function (l) {
                if (!l.attributes.href)
                    return;
                var stream = buildJSON.streams[l.attributes.href];
                if (!stream)
                    return;
                l.setAttribute('href', "".concat(buildJSON.buildDir).concat(l.attributes.href));
                stream.files.forEach(function (f) {
                    // console.log(f);
                    // find --ignore-build
                    var regex = /--ignore-build\s*/g;
                    if (!regex.test(f))
                        return;
                    // console.log('Includes ignore build', f);
                    f = f.replace('--ignore-build', '').trim();
                    var link = (0, node_html_parser_1.parse)("<link rel=\"stylesheet\" href=\"".concat(f, "\">"));
                    // console.log(link.innerHTML);
                    insertBefore(l.parentNode, link, l);
                });
            });
            break;
        case 'dev': // development (do not combine files)
            Object.keys(builds).forEach(function (script) {
                if (script.endsWith('.js')) {
                    var scriptTag_1 = root.querySelector("script[src=\"".concat(script, "\"]"));
                    if (!scriptTag_1)
                        return;
                    builds[script].forEach(function (build) {
                        var newScript = (0, node_html_parser_1.parse)("<script src=\"".concat(build.replace('\\', ''), "\"></script>"));
                        insertBefore(scriptTag_1.parentNode, newScript, scriptTag_1);
                    });
                    scriptTag_1.remove();
                }
                else if (script.endsWith('.css')) {
                    var linkTag_1 = root.querySelector("link[href=\"".concat(script, "\"]"));
                    if (!linkTag_1)
                        return;
                    builds[script].forEach(function (build) {
                        var newLink = (0, node_html_parser_1.parse)("<link rel=\"stylesheet\" href=\"".concat(build.replace('\\', ''), "\">"));
                        insertBefore(linkTag_1.parentNode, newLink, linkTag_1);
                    });
                    linkTag_1.remove();
                }
            });
    }
    return root.toString();
};
var templates = new Map();
/**
 * Gets an html template from the templates folder
 *
 * @export
 * @param {string} file the file name with no extension (ex '/index')
 * @returns {string|boolean} false if there is an error, otherwise the html
 */
function getTemplateSync(file, options) {
    if (templates.has(file)) {
        return templates.get(file);
    }
    var p = file;
    if (!file.includes('.html'))
        file += '.html';
    if (!(file.startsWith('.')))
        p = path.resolve('./templates', file);
    else {
        var stack = (0, callsite_1.default)(), requester = stack[1].getFileName(), requesterDir = path.dirname(requester);
        p = path.resolve(requesterDir, p);
    }
    p = path.resolve(__dirname, p);
    if (!fs.existsSync(p)) {
        console.error("Template ".concat(p, " does not exist. Input:"), file);
        return false;
    }
    var data = fs.readFileSync(p, 'utf8');
    data = runBuilds(data);
    templates.set(file, data);
    return options ? (0, v3_1.render)(data, options) : data;
}
exports.getTemplateSync = getTemplateSync;
;
/**
 * Gets an html template from the templates folder
 *
 * @export
 * @param {string} file the file name with no extension (ex '/index')
 * @returns {Promise<string|boolean>} false if there is an error, otherwise the html
 */
function getTemplate(file, options) {
    return new Promise(function (res, rej) {
        if (templates.has(file)) {
            return res(templates.get(file));
        }
        var p = file;
        if (!file.includes('.html'))
            file += '.html';
        if (!(file.startsWith('.')))
            p = path.resolve('./templates', file);
        else {
            var stack = (0, callsite_1.default)(), requester = stack[1].getFileName(), requesterDir = path.dirname(requester);
            p = path.resolve(requesterDir, p);
        }
        p = path.resolve(__dirname, p);
        if (!fs.existsSync(p)) {
            console.error("Template ".concat(p, " does not exist. Input:"), file);
            return false;
        }
        fs.readFile(p, 'utf8', function (err, data) {
            if (err)
                return rej(err);
            data = runBuilds(data);
            templates.set(file, data);
            res(options ? (0, v3_1.render)(data, options) : data);
        });
    });
}
exports.getTemplate = getTemplate;
/**
 * Saves an html template to the templates folder
 *
 * @export
 * @param {string} file the file name with no extension (ex '/index')
 * @param {string} data the data to save
 * @returns {boolean} whether the file was saved successfully
 */
function saveTemplateSync(file, data) {
    var p = file;
    if (!file.includes('.html'))
        file += '.html';
    if (!(file.startsWith('.')))
        p = path.resolve('./templates', file);
    else {
        var stack = (0, callsite_1.default)(), requester = stack[1].getFileName(), requesterDir = path.dirname(requester);
        p = path.resolve(requesterDir, p);
    }
    p = path.resolve(__dirname, p);
    fs.writeFileSync(p, data, 'utf8');
    return true;
}
exports.saveTemplateSync = saveTemplateSync;
/**
 * Saves an html template to the templates folder
 *
 * @export
 * @param {string} file the file name with no extension (ex '/index')
 * @param {string} data the data to save
 * @returns {Promise<boolean>} whether the file was saved successfully
 */
function saveTemplate(file, data) {
    return new Promise(function (res, rej) {
        var p = file;
        if (!file.includes('.html'))
            file += '.html';
        if (!(file.startsWith('.')))
            p = path.resolve('./templates', file);
        else {
            var stack = (0, callsite_1.default)(), requester = stack[1].getFileName(), requesterDir = path.dirname(requester);
            p = path.resolve(requesterDir, p);
        }
        p = path.resolve(__dirname, p);
        fs.writeFile(p, data, 'utf8', function (err) {
            if (err)
                return rej(err);
            res(true);
        });
    });
}
exports.saveTemplate = saveTemplate;
/**
 * Saves a file to the uploads folder
 *
 * @export
 * @param {*} data the data to save
 * @param {string} filename the filename to save it as
 * @returns {Promise<void>}
 */
function saveUpload(data, filename) {
    return new Promise(function (res, rej) {
        data = Buffer.from(data, 'binary');
        fs.writeFile(path.resolve(__dirname, '../uploads', filename), data, function (err) {
            if (err)
                rej(err);
            else
                res();
        });
    });
}
exports.saveUpload = saveUpload;
/**
 * Description placeholder
 *
 * @export
 * @param {File[]} files
 * @returns {Promise<void>}
 */
function uploadMultipleFiles(files) {
    return new Promise(function (resolve, reject) {
        var promises = [];
        files.forEach(function (file) {
            promises.push(saveUpload(file.data, file.filename + file.ext));
        });
        Promise.all(promises).then(function () { return resolve(); }).catch(function (err) { return reject(err); });
    });
}
exports.uploadMultipleFiles = uploadMultipleFiles;
/**
 * Description placeholder
 *
 * @export
 * @param {string} filename
 * @returns {*}
 */
function getUpload(filename) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path.resolve(__dirname, '../uploads', filename), function (err, data) {
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });
}
exports.getUpload = getUpload;
/**
 * Description placeholder
 *
 * @export
 * @param {string} filename
 * @returns {Promise<void>}
 */
function deleteUpload(filename) {
    return new Promise(function (resolve, reject) {
        fs.unlink(path.resolve(__dirname, '../uploads', filename), function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
exports.deleteUpload = deleteUpload;
/**
 * Description placeholder
 *
 * @export
 * @param {number} bytes
 * @param {number} [decimals=2]
 * @returns {{ string: string, type: string }}
 */
function formatBytes(bytes, decimals) {
    if (decimals === void 0) { decimals = 2; }
    if (bytes === 0)
        return {
            string: '0 Bytes',
            type: 'Bytes'
        };
    var k = 1024;
    var dm = decimals < 0 ? 0 : decimals;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return {
        string: parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i],
        type: sizes[i]
    };
}
exports.formatBytes = formatBytes;
/**
 * Description placeholder
 *
 * @param {FileStreamOptions} opts
 * @returns {(req: any, res: any, next: any) => unknown}
 */
var fileStream = function (opts) {
    return function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var maxFileSize, extensions, generateFileId, fileId, _a, contentType, fileName, fileSize, fileType, fileExt, file, total;
        return __generator(this, function (_b) {
            maxFileSize = opts.maxFileSize, extensions = opts.extensions;
            maxFileSize = maxFileSize || 1000000;
            generateFileId = function () {
                return (0, uuid_1.v4)() + '-' + Date.now();
            };
            fileId = generateFileId();
            _a = req.headers, contentType = _a["x-content-type"], fileName = _a["x-file-name"], fileSize = _a["x-file-size"], fileType = _a["x-file-type"], fileExt = _a["x-file-ext"];
            if (maxFileSize && +fileSize > maxFileSize) {
                console.log('File size is too large', formatBytes(+fileSize), formatBytes(maxFileSize));
                return [2 /*return*/, res.json({
                        error: 'File size too large'
                    })];
            }
            if (extensions && !extensions.includes(fileExt)) {
                console.log('File type is not allowed', fileExt, extensions);
            }
            if (!fileExt.startsWith('.'))
                fileExt = '.' + fileExt;
            // never overwrite files
            while (fs.existsSync(path.resolve(__dirname, '../uploads', fileId + fileExt))) {
                fileId = generateFileId();
            }
            file = fs.createWriteStream(path.resolve(__dirname, '../uploads', fileId + fileExt));
            total = 0;
            req.on('data', function (chunk) {
                file.write(chunk);
                total += chunk.length;
                console.log('Uploaded', formatBytes(total), formatBytes(+fileSize), "(".concat(Math.round(total / +fileSize * 100), "% )"));
            });
            req.on('end', function () {
                file.end();
                req.file = {
                    id: fileId,
                    name: fileName,
                    size: fileSize,
                    type: fileType,
                    ext: fileExt,
                    contentType: contentType
                };
                next();
            });
            req.on('error', function (err) {
                console.log(err);
                res.json({
                    error: 'Error uploading file: ' + fileName
                });
            });
            return [2 /*return*/];
        });
    }); };
};
exports.fileStream = fileStream;
/**
 * Description placeholder
 *
 * @export
 * @param {string} dir
 * @param {FileCb} cb
 * @param {FileOpts} [options={}]
 */
function openAllInFolderSync(dir, cb, options) {
    if (!dir)
        throw new Error('No directory specified');
    if (!cb)
        throw new Error('No callback function specified');
    if (!fs.existsSync(dir))
        return;
    if (!fs.lstatSync(dir).isDirectory())
        return;
    var files = fs.readdirSync(dir);
    files.sort(function (a, b) {
        // put directories first
        var aIsDir = fs.lstatSync(path.resolve(dir, a)).isDirectory();
        var bIsDir = fs.lstatSync(path.resolve(dir, b)).isDirectory();
        return aIsDir ? 1 : bIsDir ? -1 : 0;
    });
    if (!options)
        options = {};
    if (options.sort) {
        files.sort(function (a, b) {
            if (fs.lstatSync(path.resolve(dir, a)).isDirectory() || fs.lstatSync(path.resolve(dir, b)).isDirectory())
                return 0;
            return (options === null || options === void 0 ? void 0 : options.sort) ? options.sort(path.resolve(dir, a), path.resolve(dir, b)) : 0 || 0;
        });
    }
    files.forEach(function (file) {
        var filePath = path.resolve(dir, file);
        if (fs.lstatSync(filePath).isDirectory())
            openAllInFolderSync(filePath, cb, options);
        else
            cb(filePath);
    });
}
exports.openAllInFolderSync = openAllInFolderSync;
/**
 * Description placeholder
 *
 * @export
 * @param {string} dir
 * @param {FileCb} cb
 * @param {FileOpts} [options={}]
 * @returns {Promise<void>}
 */
function openAllInFolder(dir, cb, options) {
    if (options === void 0) { options = {}; }
    if (!dir)
        throw new Error('No directory specified');
    if (!cb)
        throw new Error('No callback function specified');
    return new Promise(function (resolve, reject) {
        if (!fs.existsSync(dir))
            return resolve();
        if (!fs.lstatSync(dir).isDirectory())
            return resolve();
        fs.readdir(dir, function (err, files) {
            if (err)
                return reject(err);
            files.forEach(function (file) {
                var filePath = path.resolve(dir, file);
                if (fs.lstatSync(filePath).isDirectory())
                    openAllInFolder(filePath, cb);
                else
                    cb(filePath);
            });
        });
    });
}
exports.openAllInFolder = openAllInFolder;
var LogType;
(function (LogType) {
    LogType["request"] = "request";
    LogType["error"] = "error";
    LogType["debugger"] = "debugger";
    LogType["status"] = "status";
})(LogType = exports.LogType || (exports.LogType = {}));
function log(type, dataObj) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new objects_to_csv_1.default([dataObj]).toDisk(path.resolve(__dirname, "../logs/".concat(type, ".csv")), { append: true })];
        });
    });
}
exports.log = log;
