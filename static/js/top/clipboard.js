/**
 * 
 * @param {String} text text to copy into clipboard 
 */
function copyText(text) {
    navigator.clipboard.writeText(text);
    createNotification('Clipboard', `Copied text: ${text}`, 'success');
}