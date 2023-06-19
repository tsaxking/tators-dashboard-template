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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uglify_js_1 = __importDefault(require("uglify-js"));
const postcss_1 = __importDefault(require("postcss"));
const cssnano_1 = __importDefault(require("cssnano"));
const autoprefixer_1 = __importDefault(require("autoprefixer"));
const axios_1 = __importDefault(require("axios"));
const child_process_1 = __importDefault(require("child_process"));
const sass_1 = __importDefault(require("sass"));
// import { compile } from '@gerhobbelt/gitignore-parser';
const worker_threads_1 = require("worker_threads");
const typescript_1 = __importDefault(require("typescript"));
var Colors;
(function (Colors) {
    Colors["Reset"] = "\u001B[0m";
    Colors["Bright"] = "\u001B[1m";
    Colors["Dim"] = "\u001B[2m";
    Colors["Underscore"] = "\u001B[4m";
    Colors["Blink"] = "\u001B[5m";
    Colors["Reverse"] = "\u001B[7m";
    Colors["Hidden"] = "\u001B[8m";
    Colors["FgBlack"] = "\u001B[30m";
    Colors["FgRed"] = "\u001B[31m";
    Colors["FgGreen"] = "\u001B[32m";
    Colors["FgYellow"] = "\u001B[33m";
    Colors["FgBlue"] = "\u001B[34m";
    Colors["FgMagenta"] = "\u001B[35m";
    Colors["FgCyan"] = "\u001B[36m";
    Colors["BgBlack"] = "\u001B[40m";
    Colors["BgRed"] = "\u001B[41m";
    Colors["BgGreen"] = "\u001B[42m";
    Colors["BgYellow"] = "\u001B[43m";
    Colors["BgBlue"] = "\u001B[44m";
    Colors["BgMagenta"] = "\u001B[45m";
    Colors["BgCyan"] = "\u001B[46m";
})(Colors || (Colors = {}));
worker_threads_1.workerData.watchIgnoreList = [
    '../package.json',
    '../package-lock.json'
];
const watchIgnoreDirs = [
    path.resolve(__dirname, './dependencies'),
    path.resolve(__dirname, '../uploads'),
    path.resolve(__dirname, '../static/build'),
    path.resolve(__dirname, '../archive'),
    path.resolve(__dirname, '../history'),
    path.resolve(__dirname, '../db'),
    path.resolve(__dirname, '../test-env'),
    path.resolve(__dirname, '../.git'),
    path.resolve(__dirname, '../.vscode'),
    path.resolve(__dirname, '../.idea'),
    path.resolve(__dirname, '../.gitignore'),
    path.resolve(__dirname, '../.gitattributes'),
    path.resolve(__dirname, './updates'),
    path.resolve(__dirname, '../logs')
];
const dirs = [
    '../static',
    '../static/build',
    './dependencies'
];
for (const dir of dirs) {
    if (!fs.existsSync(path.resolve(__dirname, dir))) {
        fs.mkdirSync(path.resolve(__dirname, dir));
    }
}
const readJSON = (path) => {
    let content = fs.readFileSync(path, 'utf8');
    // remove all /* */ comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    // remove every comment after "// "
    content = content.replace(/\/\/ .*/g, '');
    return JSON.parse(content);
};
const build = readJSON(path.resolve(__dirname, './build.json'));
const frontTs = fs.readFileSync(path.resolve(__dirname, './front-ts.json'), 'utf8');
const { streams, ignore, minify } = build;
const fromUrl = async (url) => {
    return new Promise(async (res, rej) => {
        const safeUrl = url.replace(new RegExp('/', 'g'), '');
        let data;
        if (fs.existsSync(path.resolve(__dirname, `./dependencies/${safeUrl}`))) {
            data = fs.readFileSync(path.resolve(__dirname, `./dependencies/${safeUrl}`), 'utf8');
        }
        else {
            data = (await axios_1.default.get(url)).data;
            fs.writeFileSync(path.resolve(__dirname, `./dependencies/${safeUrl}`), data);
        }
        res({ data, safeUrl });
    });
};
const fromTs = async (filePath, stream, ext, streamName) => {
    return new Promise(async (res, rej) => {
        const tsConfig = readJSON(path.resolve(__dirname, filePath, './tsconfig.json'));
        const program = typescript_1.default.createProgram([filePath], {
            ...tsConfig.compilerOptions,
            noEmitOnError: true
        });
        const emitResult = program.emit();
        const allDiagnostics = typescript_1.default.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
        allDiagnostics.forEach(diagnostic => {
            if (diagnostic.file) {
                const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                const message = typescript_1.default.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            }
            else {
                console.log(typescript_1.default.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
            }
        });
        const exitCode = emitResult.emitSkipped ? 1 : 0;
        if (exitCode !== 0) {
            console.error(new Error('There was an error compiling the project'));
        }
        if (tsConfig?.compilerOptions?.outFile) {
            return res(fromFile(tsConfig.compilerOptions.outFile, stream, ext, streamName));
        }
        if (tsConfig?.compilerOptions?.outDir) {
            return res(fromDir(tsConfig.compilerOptions.outDir, '.js', stream, [], streamName));
        }
        const readDir = (dirPath) => {
            const files = fs.readdirSync(dirPath);
            for (const file of files) {
                if (fs.lstatSync(path.resolve(dirPath, file)).isDirectory()) {
                    readDir(path.resolve(dirPath, file));
                    continue;
                }
                if (file.endsWith('.ts'))
                    worker_threads_1.workerData.watchIgnoreList.push(path.resolve(dirPath, file.replace('.ts', '.js')));
            }
        };
        if (fs.lstatSync(filePath).isDirectory()) {
            readDir(filePath);
        }
    });
};
const fromSass = async (filePath, stream) => {
    return new Promise(async (res, rej) => {
        const { css } = sass_1.default.compile(path.resolve(__dirname, filePath), {
            outputStyle: 'compressed'
        });
        stream.write(css.toString());
        res(null);
    });
};
const fromFile = (filePath, stream, ext, streamName) => {
    return new Promise((res, rej) => {
        try {
            // console.log(path.extname(filePath), ext);
            if (path.extname(filePath) !== ext) {
                return res(null);
            }
            // console.log(filePath);
            const content = fs.readFileSync(filePath, 'utf8');
            stream.write(content);
            worker_threads_1.workerData.builds[streamName].push(filePath);
        }
        catch (err) {
            console.error('Error adding file:', filePath);
            res(null);
        }
    });
};
const fromDir = async (dirPath, ext, stream, ignoreList, streamName) => {
    ignoreList = ignoreList.map((file) => path.resolve(__dirname, file));
    const readDir = async (dirPath) => {
        if (dirPath.includes('[ts]')) {
            await fromTs(dirPath, stream, ext, streamName);
            return;
        }
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            if (fs.lstatSync(path.resolve(dirPath, file)).isDirectory()) {
                if (dirPath.includes('.git'))
                    continue;
                await readDir(path.resolve(dirPath, file));
                continue;
            }
            if (ext && !file.endsWith(ext))
                continue;
            if (ignoreList.includes(file))
                continue;
            await fromFile(path.resolve(dirPath, file), stream, ext, streamName);
        }
    };
    if (fs.lstatSync(dirPath).isDirectory())
        readDir(dirPath);
    else
        console.error('Error reading directory:', dirPath);
};
const copyFile = async (filePath, streamName, index) => {
    return new Promise(async (res, rej) => {
        if (filePath.includes('http')) {
            console.log('Requesting: ', filePath);
            const { data, safeUrl } = await fromUrl(filePath);
            fs.writeFileSync(path.resolve(__dirname, '..', 'static', 'build', 'dir-' + streamName.replace('.', '-'), index + safeUrl), data);
            return res();
        }
        ;
        if (!fs.existsSync(path.resolve(__dirname, filePath.replace('[ts]', '')))) {
            console.error('File does not exist:', filePath);
            return res();
        }
        fs.cpSync(path.resolve(__dirname, filePath.replace('[ts]', '')), path.resolve(__dirname, '..', 'static', 'build', 'dir-' + streamName.replace('.', '-'), index + filePath
            .replace(new RegExp('/', 'g'), '')), { recursive: true });
        res();
    });
};
const serverFunctions = () => {
    return new Promise((res, rej) => {
        const child = child_process_1.default.spawn('tsc', [], {
            stdio: 'pipe',
            shell: true,
            cwd: path.resolve(__dirname, '../server-functions'),
            env: process.env
        });
        child.on('error', console.error);
        child.stdout.on('data', console.log);
        child.stderr.on('data', console.error);
        child.on('close', () => {
            res();
        });
    });
};
const runBuild = async () => {
    worker_threads_1.parentPort?.postMessage('build-start');
    worker_threads_1.workerData.builds = {};
    await serverFunctions();
    let { length } = Object.keys(build.streams);
    let count = 0;
    const countUp = () => {
        count++;
        if (count === length) {
            worker_threads_1.parentPort?.postMessage('build-complete');
            count = 0;
        }
    };
    if (fs.existsSync(path.resolve(__dirname, './ignore-list.txt'))) {
        fs.unlinkSync(path.resolve(__dirname, './ignore-list.txt'));
    }
    for (let [streamName, data] of Object.entries(streams)) {
        console.log('\x1b[32m', 'Stream:', '\x1b[0m', streamName);
        const min = streamName.replace(path.extname(streamName), '.min' + path.extname(streamName));
        worker_threads_1.workerData.watchIgnoreList.push(path.resolve(__dirname, `../static/build/${streamName}`));
        worker_threads_1.workerData.watchIgnoreList.push(path.resolve(__dirname, `../static/build/${min}`));
        fs.writeFileSync(path.resolve(__dirname, `../static/build/${streamName}`), '');
        fs.writeFileSync(path.resolve(__dirname, `../static/build/${min}`), '');
        const { ignore: streamIgnore, files, priority } = data;
        if (fs.existsSync(path.resolve(__dirname, `../static/build/dir-${streamName.replace('.', '-')}`))) {
            // remove old build
            fs.rmSync(path.resolve(__dirname, `../static/build/dir-${streamName.replace('.', '-')}`), { recursive: true });
        }
        fs.mkdirSync(path.resolve(__dirname, `../static/build/dir-${streamName.replace('.', '-')}`));
        // if (files.some(f => f.includes('[ts]'))) {
        //     console.log('Has ts');
        //     fs.writeFileSync(path.resolve(__dirname, '..', 'static', 'build', 'dir-' + streamName.replace('.', '-'), 'tsconfig.json'), frontTs);
        //     hasTs = true;
        // }
        const stream = fs.createWriteStream(path.resolve(__dirname, `../static/build/${streamName}`));
        const streamIgnoreList = [...(ignore || []), ...(streamIgnore || [])];
        worker_threads_1.workerData.builds[streamName] = [];
        for (let [index, file] of Object.entries(files)) {
            if (file.includes('--ignore-build'))
                continue;
            if (file.includes('http')) {
                if (!file.includes('--force'))
                    continue;
                file = file.replace('--force', '');
            }
            file = file.trim();
            await copyFile(file, streamName, +index);
        }
        await fromDir(path.resolve(__dirname, '..', 'static', 'build', 'dir-' + streamName.replace('.', '-')), path.extname(streamName), stream, streamIgnoreList, streamName);
        stream.close(async (error) => {
            // fs.rmSync(path.resolve(__dirname, `../static/build/'dir-${streamName}`), { recursive: true });
            if (error) {
                return console.error(error);
            }
            if (minify) {
                // continue;
                const streamPath = path.resolve(__dirname, '../static/build', streamName);
                let content = fs.readFileSync(streamPath, 'utf8');
                const ext = path.extname(streamPath);
                const minStreamName = streamName.replace(ext, '.min' + ext);
                console.log('Minifying', streamName + '...');
                console.log(ext);
                switch (ext) {
                    case '.js':
                        console.log('Minifying JS...');
                        content = uglify_js_1.default.minify(content, {
                            compress: {
                                drop_console: true
                            }
                        }).code;
                        break;
                    case '.css':
                        console.log('Minifying CSS...');
                        content = await (0, postcss_1.default)([autoprefixer_1.default, cssnano_1.default]).process(content, { from: undefined })
                            .then(result => {
                            return result.css;
                        }).catch(err => {
                            console.log("ERROR MINIFYING CSS", err);
                        }) || '';
                        break;
                }
                if (!content)
                    content = '';
                fs.writeFileSync(path.resolve(__dirname, '../static/build', minStreamName), content);
                // if (watchIgnoreList.length) fs.writeFileSync(path.resolve(__dirname, './ignore-list.txt'), watchIgnoreList.join('\n'));
                // try {
                //     fs.rmSync(path.resolve(__dirname, `../static/build/dir-${streamName.replace('.', '-')}`), { recursive: true });
                // } catch {}
            }
            countUp();
        });
    }
};
let timeout = null;
const buildTimeout = () => {
    if (timeout)
        clearTimeout(timeout);
    timeout = setTimeout(() => {
        console.log('Building...');
        runBuild();
    }, 1000);
};
(async () => {
    const readDir = (dirPath) => {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            if (fs.lstatSync(path.resolve(dirPath, file)).isDirectory()) {
                readDir(path.resolve(dirPath, file));
                continue;
            }
            if (file.endsWith('.ts')) {
                worker_threads_1.workerData.watchIgnoreList.push(path.resolve(dirPath, file.replace('.ts', '.js')));
            }
        }
    };
    readDir(path.resolve(__dirname, '../server-functions'));
    await runBuild();
    fs.watch('../', { recursive: true }, (eventType, filename) => {
        if (!filename)
            return;
        if (worker_threads_1.workerData.watchIgnoreList.includes(path.resolve(__dirname, '../../', filename)))
            return;
        if (watchIgnoreDirs.some((dir) => path.resolve(__dirname, '../../', filename).includes(dir)))
            return;
        const extNames = [
            '.js',
            '.css',
            '.ts',
            '.html',
            '.scss',
            '.sass',
            '.json'
        ];
        if (!extNames.includes(path.extname(filename)))
            return;
        console.log(Colors.FgMagenta, eventType, Colors.Reset, '->', Colors.FgCyan, filename, Colors.Reset);
        buildTimeout();
    });
})();
