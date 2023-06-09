CustomBootstrap.ContextMenuSection = class Section extends CustomBootstrap.Element {}
CustomBootstrap.ContextMenuItem = class Item extends CustomBootstrap.Element {}
CustomBootstrap.ContextMenu = class ContextMenu extends CustomBootstrap.Element {
    /**
     * 
     * @param {HTMLElement} target The HTML element to trigger the context menu on 
     * @param {Object[]} sections The sections of the context menu
     * @param {Object} sections[].name The name of the section
     * @param {Object[]} sections[].items The items of the section
     * @param {Object} sections[].items[].name The name of the item
     * @param {Function} sections[].items[].action Function to run when the item is clicked
     * @param {String} sections[].items[].color The color of the item
     * @param {Object} options Options
     * @param {String} options.ignoreFrom Selector of elements to ignore right clicks on 
     */
    constructor(target, sections, options = {}) {
        super();
        this.target = target;
        this.sections = sections;
        this.options = options;
        this.target.addEventListener('contextmenu', this.render.bind(this));
    }

    render(e) {
        const {
            ignoreFrom
        } = this.options;

        const ignoreEls = [];
        if (Array.isArray(ignoreFrom)) {
            ignoreFrom.forEach(i => {
                el.querySelectorAll(i).forEach(_e => {
                    ignoreEls.push(_e);
                });
            });
            // return if the element is in the ignore list or is a child of one of the ignore list elements.
            if (ignoreEls.some(i => i.contains(e.target))) {
                // console.log('Ignoring right click');
                return;
            }
        }

        e.preventDefault();
        const contextmenuContainer = document.querySelector('#contextmenu-container');

        const menu = createElementFromSelector('div.contextmenu.show.bg-dark.text-light.animate__animated.animate__flipInY.animate__faster');
        menu.innerHTML = '';

        this.sections.forEach(section => {
            const { name, items } = section;
            // const sectionEl = document.createElement('li');
            const sectionTitle = createElementFromSelector('p.ws-nowrap.bg-dark.text-secondary.p-1.rounded.m-0.no-select');
            sectionTitle.innerHTML = name;
            // sectionEl.appendChild(sectionTitle);
            menu.appendChild(sectionTitle);

            // const sectionDivider = document.createElement('li');
            const sectionDividerEl = createElementFromSelector('hr.dropdown-divider.bg-light.m-0');
            // sectionDivider.appendChild(sectionDividerEl);
            menu.appendChild(sectionDividerEl);

            items.forEach(item => {
                const { name, func, color } = item;
                // const itemEl = document.createElement('li');
                const itemElLink = createElementFromSelector('p.ws-nowrap.cursor-pointer.bg-dark.text-light.m-0.p-1.rounded');

                itemElLink.addEventListener('mouseover', () => {
                    itemElLink.classList.remove('bg-dark');
                    itemElLink.classList.add(`bg-${color ? color : 'primary'}`);
                });
                itemElLink.addEventListener('mouseout', () => {
                    itemElLink.classList.remove(`bg-${color ? color : 'primary'}`);
                    itemElLink.classList.add('bg-dark');
                });

                itemElLink.innerHTML = name;
                itemElLink.addEventListener('click', func);
                // itemEl.appendChild(itemElLink);
                menu.appendChild(itemElLink);
            });
        });

        const { clientX: mouseX, clientY: mouseY } = e;
        contextmenuContainer.style.left = mouseX + 'px';
        contextmenuContainer.style.top = mouseY + 'px';
        contextmenuContainer.appendChild(menu);
    }

    removeListener() {
        return this.target.removeEventListener('contextmenu', this.render.bind(this));
    }

    hide() {
        const contextmenuContainer = document.querySelector('#contextmenu-container');
        contextmenuContainer.innerHTML = '';
    }
}