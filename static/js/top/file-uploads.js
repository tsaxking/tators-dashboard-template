// // Data url:
// // Get a reference to the file input
// const fileInput = document.querySelector('input#thing');

// // Listen for the change event so we can capture the file
// fileInput.addEventListener('change', (e) => {
//     // Get a reference to the file
//     const file = e.target.files[0];

//     // Encode the file using the FileReader API
//     const reader = new FileReader();
//     reader.onloadend = () => {
//         console.log(reader.result);
//         // Logs data:<type>;base64,wL2dvYWwgbW9yZ...
//     };
//     reader.readAsDataURL(file);
// });

// function fileUploadToDataUrl(input) {
//     // Get a reference to the file
//     const file = input.files[0];

//     // Encode the file using the FileReader API
//     const reader = new FileReader();
//     reader.onloadend = () => {
//         console.log(reader.result);
//         // Logs data:<type>;base64,wL2dvYWwgbW9yZ...
//     };
//     reader.readAsDataURL(file);
// }





// FileReader:

function fileUpload(file, cb, cbError) {
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function(evt) {
            if (cb) cb(evt);
            // document.getElementById("fileContents").innerHTML = evt.target.result;
        }
        reader.onerror = function(evt) {
            console.log('Error reading file');
            if (cbError) cbError(evt);
            // document.getElementById("fileContents").innerHTML = "error reading file";
        }
    }
}

/**
 * 
 * @param {Element} input File input element 
 * @param {Function} callback Function to call when file is loaded 
 * @param {Array} accept Array of accepted file types ['pdf','png','jpg']
 * @param {Function} unacceptableCb (optional) Function to call when file is unacceptable, else it will create an alert
 */
function readMultipleFiles(input, callback, accept, unacceptableCb) {
    if (!input.querySelector) throw new Error('input must be a node!');
    if (!callback) throw new Error('readMultipleFiles requires a callback!');

    const { files } = input;

    var reader = new FileReader();
    let fileBin = [];

    const readFile = (index) => {
        const file = files[index];

        if (index >= files.length) {
            callback(fileBin);
            return;
        }

        const splitName = file.name.split('.');
        const ext = splitName[splitName.length - 1];
        if (!accept.find(a => a.toLowerCase() == ext.toLowerCase())) {
            if (unacceptableCb) unacceptableCb(file, index);
            else alert('File type not accepted!');
            return;
        }

        reader.onloadend = (e) => {
            // get file content
            fileBin.push({
                filename: file.name,
                data: e.target.result,
                extension: ext
            });
            readFile(index + 1);
        }
        reader.readAsBinaryString(file);
    }
    readFile(0);
}

async function readFiles(input, accept = []) {
    if (!input.querySelector) throw new Error('input must be a node!');
    const { files } = input;

    var reader = new FileReader();
    return await Promise.all(Array.from(files).map(async(file) => {
        const splitName = file.name.split('.');
        const ext = splitName[splitName.length - 1];
        if (!accept.find(a => a.toLowerCase() == ext.toLowerCase())) {
            alert('File type not accepted!');
            return;
        }

        return await new Promise((resolve, reject) => {
            reader.onloadend = (e) => {
                // get file content
                resolve({
                    filename: file.name,
                    data: e.target.result,
                    extension: ext
                });
            }
            reader.readAsBinaryString(file);
        });
    }));
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (parseFloat((bytes / Math.pow(k, i)).toFixed(dm))) + ' ' + sizes[i];
}

function viewImageFromFileUpload(input, target) {
    if (input.files.length > 0) {
        var reader = new FileReader();

        reader.onload = function(e) {
            target.setAttribute('src', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

/**
 * 
 * @param {String} url Url to upload to 
 * @param {HTMLInputElement} fileInput File input element
 * @param {Object} options Options
 * @returns {Promise}
 */
function fileStream(url, fileInput, options = {}) {
    if (typeof url !== 'string') throw new Error('url must be a string!');
    if (!fileInput.querySelector) throw new Error('fileInput must be a node!');

    return new Promise(async (resolve, reject) => {
        const ping = new Ping();
        await ping.run();
        if (ping.latency > 1000) {
            const confirmation = await CustomBootstrap.confirm('Poor internet connection! Are you sure you want to continue?');
            if (!confirmation) {
                // remove files
                fileInput.value = '';
                return reject('Poor internet connection!');
            }
        }

        // uploads a file to the server through a stream
        const { files } = fileInput;

        const pb = new CustomBootstrap.ProgressBar();

        const streamFile = (index) => {
            const file = files[index];
            if (!file) {
                pb.destroy();
                return resolve();
            }

            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);

            let filename = file.name.split('.');
            filename.pop();
            filename = filename.join('.');

            xhr.setRequestHeader('Content-Type', 'application/octet-stream');
            xhr.setRequestHeader('X-File-Name', filename);
            xhr.setRequestHeader('X-File-Size', file.size);
            xhr.setRequestHeader('X-File-Type', file.type);
            xhr.setRequestHeader('X-File-Index', index);
            xhr.setRequestHeader('X-File-Count', files.length);
            xhr.setRequestHeader('X-File-Name', file.name);
            xhr.setRequestHeader('X-File-Ext', file.name.split('.').pop());

            if (options.headers) {
                Object.keys(options.headers).forEach((key) => {
                    xhr.setRequestHeader('X-Custom-' + key, options.headers[key]);
                });
            }

            xhr.onload = (e) => {
                streamFile(index + 1);
            }

            xhr.onerror = (e) => {
                pb.destroy();
                CustomBootstrap.alert('Error uploading file!', 'danger', 'Error');
                reject(e);
            }

            xhr.upload.onprogress = (e) => {

                const totalFiles = files.length;
                const percent = (e.loaded / e.total);
                const percentTotal = (index / totalFiles) + (percent / totalFiles);
                pb.progress = Math.round(percentTotal * 100);
            }

            xhr.onreadystatechange = (e) => {
                if (xhr.readyState == 4) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        CustomBootstrap.notify(response);
                    } catch (e) {
                        console.error(e);
                        const { responseText } = xhr;
                        CustomBootstrap.notify(responseText);
                    }
                    
                }
            }

            xhr.send(file);
        };

        streamFile(0);
    });
}