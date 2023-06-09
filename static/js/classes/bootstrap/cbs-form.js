CustomBootstrap.Form = class Form {
    #title;

    constructor(el) {
        if (!(el instanceof Node)) throw new Error('el must be a Node');
        if (typeof title !== 'string') throw new Error('title must be a string');

        this.el = el;
        this.#title = title;
    }

    get title() {}

    set title(title) {}


    addQuestion(question, options = {}) {}

    get questions() {}
}