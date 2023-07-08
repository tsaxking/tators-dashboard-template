document.addEventListener('DOMContentLoaded', () => {
    const page = Page.pages[window.location.pathname.split('/')[1].toLowerCase()];
    if (page) page.open();
    // open first page if no page is found
    else Object.values(Page.pages)[0]?.open();
});