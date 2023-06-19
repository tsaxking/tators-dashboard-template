import * as fs from 'fs';
import * as path from 'path';
import UglifyJS from 'uglify-js';
import postcss from 'postcss';
import cssnano from 'cssnano';
import autoprefixer from 'autoprefixer';
import axios from 'axios';
import ChildProcess from 'child_process';
import sass from 'sass';
// import { compile } from '@gerhobbelt/gitignore-parser';
import { Worker, isMainThread, workerData, parentPort } from 'worker_threads';
import ts from 'typescript';

enum Colors {
    Reset = '\x1b[0m',
    Bright = '\x1b[1m',
    Dim = '\x1b[2m',
    Underscore = '\x1b[4m',
    Blink = '\x1b[5m',
    Reverse = '\x1b[7m',
    Hidden = '\x1b[8m',
    
    FgBlack = '\x1b[30m',
    FgRed = '\x1b[31m',
    FgGreen = '\x1b[32m',
    FgYellow = '\x1b[33m',
    FgBlue = '\x1b[34m',
    FgMagenta = '\x1b[35m',
    FgCyan = '\x1b[36m',

    BgBlack = '\x1b[40m',
    BgRed = '\x1b[41m',
    BgGreen = '\x1b[42m',
    BgYellow = '\x1b[43m',
    BgBlue = '\x1b[44m',
    BgMagenta = '\x1b[45m',
    BgCyan = '\x1b[46m'
}





workerData.watchIgnoreList = [
    '../package.json',
    '../package-lock.json'
];

const watchIgnoreDirs: string[] = [
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





const readJSON = (path: string): any => {
    let content = fs.readFileSync(path, 'utf8');

    // remove all /* */ comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    // remove every comment after "// "
    content = content.replace(/\/\/ .*/g, '');

    return JSON.parse(content);
}


type Build = {
    ignore?: string[];
    minify?: boolean;
    streams: {
        [key: string]: {
            ignore?: string[];
            priority?: string[];
            // ext?: string;
            files: string[];
        }
    }
}




const build = readJSON(path.resolve(__dirname, './build.json')) as Build;
const frontTs = fs.readFileSync(path.resolve(__dirname, './front-ts.json'), 'utf8');


const { streams, ignore, minify } = build;




const fromUrl = async (url: string): Promise<any> => {
    return new Promise(async (res, rej) => {
        const safeUrl = url.replace(new RegExp('/', 'g'), '');
        let data: string;
        if (fs.existsSync(path.resolve(__dirname, `./dependencies/${safeUrl}`))) {
            data = fs.readFileSync(path.resolve(__dirname, `./dependencies/${safeUrl}`), 'utf8');
        } else {
            data = (await axios.get(url)).data;
            fs.writeFileSync(path.resolve(__dirname, `./dependencies/${safeUrl}`), data);
        }
        res({ data, safeUrl });
    });
};

const fromTs = async (filePath: string, stream: fs.WriteStream, ext: string, streamName: string): Promise<any> => {
    return new Promise(async (res, rej) => {
        const tsConfig = readJSON(path.resolve(__dirname, filePath, './tsconfig.json'));

        const program = ts.createProgram([filePath], {
            ...tsConfig.compilerOptions,
            noEmitOnError: true
        });
        const emitResult = program.emit();
    
        const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
    
        allDiagnostics.forEach(diagnostic => {
            if (diagnostic.file) {
                const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
                const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            } else {
                console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
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

        const readDir = (dirPath: string) => {
            const files = fs.readdirSync(dirPath);
            for (const file of files) {
                if (fs.lstatSync(path.resolve(dirPath, file)).isDirectory()) {
                    readDir(path.resolve(dirPath, file));
                    continue;
                }

                if (file.endsWith('.ts')) workerData.watchIgnoreList.push(path.resolve(dirPath, file.replace('.ts', '.js')));
            }
        };

        if (fs.lstatSync(filePath).isDirectory()) {
            readDir(filePath);
        }
    });
}

const fromSass = async (filePath: string, stream: fs.WriteStream): Promise<any> => {
    return new Promise(async (res, rej) => {
        const { css } = sass.compile(path.resolve(__dirname, filePath), {
            outputStyle: 'compressed'
        } as any);

        stream.write(css.toString());

        res(null);
    });
}

const fromFile = (filePath: string, stream: fs.WriteStream, ext: string, streamName: string): Promise<any> => {
    return new Promise((res, rej) => {
        try {
            // console.log(path.extname(filePath), ext);
            if (path.extname(filePath) !== ext) {
                return res(null);
            }
            // console.log(filePath);
            const content = fs.readFileSync(filePath, 'utf8');
            stream.write(content);

            workerData.builds[streamName].push(filePath);
        } catch (err) {
            console.error('Error adding file:', filePath);
            res(null);
        }
    });
}



const fromDir = async (dirPath: string, ext: string, stream: fs.WriteStream, ignoreList: string[], streamName: string): Promise<any> => {
    ignoreList = ignoreList.map((file) => path.resolve(__dirname, file));

    const readDir = async (dirPath: string) => {
        if (dirPath.includes('[ts]')) {
            await fromTs(dirPath, stream, ext, streamName);
            return;
        }

        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            if (fs.lstatSync(path.resolve(dirPath, file)).isDirectory()) {
                if (dirPath.includes('.git')) continue;
                await readDir(path.resolve(dirPath, file));
                continue;
            }

            if (ext && !file.endsWith(ext)) continue;
            if (ignoreList.includes(file)) continue;

            await fromFile(path.resolve(dirPath, file), stream, ext, streamName);
        }
    }
    if (fs.lstatSync(dirPath).isDirectory()) readDir(dirPath);
    else console.error('Error reading directory:', dirPath);
};







const copyFile = async (filePath: string, streamName: string, index: number): Promise<void> => {
    return new Promise(async(res, rej) => {
        if (filePath.includes('http')) {
            console.log('Requesting: ', filePath);
            const { data, safeUrl } = await fromUrl(filePath);
            fs.writeFileSync(
                path.resolve(__dirname, '..', 'static', 'build', 'dir-' + streamName.replace('.', '-'), 
                    index + safeUrl
                ), 
                data);
            return res();
        };

        if (!fs.existsSync(path.resolve(__dirname, filePath.replace('[ts]', '')))) {
            console.error('File does not exist:', filePath);
            return res();
        }

        fs.cpSync(
            path.resolve(__dirname, filePath.replace('[ts]', '')), 
            path.resolve(__dirname, '..', 'static', 'build', 'dir-' + streamName.replace('.', '-'), 
                index + filePath
                    .replace(new RegExp('/', 'g'), '')
            ), 
            { recursive: true }
        );

        res();
    });
};


const serverFunctions = (): Promise<void> => {
    return new Promise((res, rej) => {
        const child = ChildProcess.spawn('tsc', [], {
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
}

const runBuild = async() => {
    
    parentPort?.postMessage('build-start');
    workerData.builds = {};

    await serverFunctions();

    let { length } = Object.keys(build.streams);
    let count = 0;


    const countUp = () => {
        count++;
        if (count === length) {
            parentPort?.postMessage('build-complete');
            count = 0;
        }
    }

    
    if (fs.existsSync(path.resolve(__dirname, './ignore-list.txt'))) {
        fs.unlinkSync(path.resolve(__dirname, './ignore-list.txt'));
    }



    for (let [streamName, data] of Object.entries(streams)) {
        console.log('\x1b[32m', 'Stream:', '\x1b[0m', streamName);

        const min = streamName.replace(path.extname(streamName), '.min' + path.extname(streamName));

        workerData.watchIgnoreList.push(path.resolve(__dirname, `../static/build/${streamName}`));
        workerData.watchIgnoreList.push(path.resolve(__dirname, `../static/build/${min}`));
        

        fs.writeFileSync(path.resolve(__dirname, `../static/build/${streamName}`), '');
        fs.writeFileSync(path.resolve(__dirname, `../static/build/${min}`), '');

        
        const {
            ignore: streamIgnore,
            files,
            priority
        } = data;

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
        workerData.builds[streamName] = [];

        for (let [index, file] of Object.entries(files)) {
            if (file.includes('--ignore-build')) continue;
            if (file.includes('http')) {
                if (!file.includes('--force')) continue;
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
                        content = UglifyJS.minify(content, {
                            compress: {
                                drop_console: true
                            }
                        }).code;
                        break;
                    case '.css':
                        console.log('Minifying CSS...');
                        content = await postcss([autoprefixer, cssnano]).process(content, { from: undefined })
                            .then(result => {
                                return result.css;
                            }
                            ).catch(err => {
                                console.log("ERROR MINIFYING CSS", err);
                            }) || '';
                        break;
                }

                if (!content) content = '';
    
                fs.writeFileSync(path.resolve(__dirname, '../static/build', minStreamName), content);

                // if (watchIgnoreList.length) fs.writeFileSync(path.resolve(__dirname, './ignore-list.txt'), watchIgnoreList.join('\n'));
                // try {
                //     fs.rmSync(path.resolve(__dirname, `../static/build/dir-${streamName.replace('.', '-')}`), { recursive: true });
                // } catch {}
            }

            countUp();
        });
    }
}

let timeout: NodeJS.Timeout | null = null;
const buildTimeout = () => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
        console.log('Building...');
        runBuild();
    }, 1000);
}



(async () => {

    const readDir = (dirPath: string) => {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            if (fs.lstatSync(path.resolve(dirPath, file)).isDirectory()) {
                readDir(path.resolve(dirPath, file));
                continue;
            }

            if (file.endsWith('.ts')) {
                workerData.watchIgnoreList.push(path.resolve(dirPath, file.replace('.ts', '.js')));
            }
        }
    };

    readDir(path.resolve(__dirname, '../server-functions'));





    await runBuild();
    fs.watch('../', { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        if (workerData.watchIgnoreList.includes(path.resolve(__dirname, '../../', filename))) return;

        if (watchIgnoreDirs.some((dir) => path.resolve(__dirname, '../../', filename).includes(dir))) return;

        const extNames = [
            '.js',
            '.css',
            '.ts',
            '.html',
            '.scss',
            '.sass',
            '.json'
        ];

        if (!extNames.includes(path.extname(filename))) return;

        console.log(Colors.FgMagenta, eventType, Colors.Reset, '->', Colors.FgCyan, filename, Colors.Reset);
        buildTimeout();
    });
})();