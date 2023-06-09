class FIRSTQuestion {
    /**
     * Creates a question for pit-scout or pre-scout questions
     * @param {string} param0.question The actual text of the question ex. "What drive are they using?"
     * @param {string} param0.key A key to summarize what the question is
     * @param {string} param0.type What type of question it is. Can be either: "text", "textarea", "number", "checkbox", "radio", "select", or "boolean" 
     * @param {string} param0.description A description of what the question is asking
     * @param {string} param0.small I honestly have no idea what this is :/
     * @param {string} param0.id A uuid for the question
     * @param {object} param0.options If this is a radio, checkbox, or select question, this will show what the options to pick from are
     * @param {{ text:string, order: number}[]} param0.options.radio An array of options if this is a radio
     * @param {{ text:string, order: number}[]} param0.options.checkbox An array of options if this is a checkbox
     * @param {{ text:string, order: number}[]} param0.options.select An array of options if this is a select
     */
    constructor({ question, key, description, type, small: FIRSTsmall, id, options: { radio, checkbox, select } }) {
        Object.assign(this, {
            question,
            key,
            description,
            type,
            // Apparently small is already a function
            small: FIRSTsmall,
            id,
            options: {
                radio,
                checkbox,
                select,
            },
        });
    }
}