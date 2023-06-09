/**
 * @fileoverview StateStack is a stack of states that can be navigated through, and BranchStack is a stack of StateStacks that can be navigated through
 */

class State {
    constructor(content) {
        /**
         * The content of the state
         * @type {Any}
         * @public
         */
        this.content = content;

        /**
         * The date the state was created
         * @type {Date}
         * @public
         */
        this.created = new Date();
    }

    /**
     * Copies the state without any dependencies
     * @returns {Any} A copy of the content
     * @public
     */
    copy() {
        if (Array.isArray(this.content)) {
            this.content = [...this.content];
        } else if (typeof this.content === 'object') {
            this.content = {...this.content };
        } else {
            this.content = JSON.parse(JSON.stringify(this.content));
        }

        return this;
    }
}

class StateStack {
    /**
     *  @example
     *  ```
     *  class YourClass extends StateStack {
     *      // the function onChange() is called every time the state changes, and is passed the new state
     *      // override this function to do what you want with the new state
     *      onChange(newState) {
     *          // do something with the new state
     *      }
     * 
     *      // the function onReject() is called when the state changes to a rejected state
     *      // override this function if you don't want an error thrown
     *      onReject() {
     *          // do something on rejection
     *      }
     *  
     *      // the function onClear() is called when the stack is cleared
     *      // override this function to do what you want with the stack being cleared
     *      onClear() {
     *          // do something on clearing
     *      }
     *  }
     * 
     *  // create a new instance of YourClass
     *  const yourClass = new YourClass();
     * 
     *  // add a new state to the stack
     *  yourClass.addState(yourState); // yourState can be anything you want, it will be passed to onChange()
     * 
     *  // go to the 'next' or 'prev' state
     *  // these will call onChange() with the new state, or if there are no states, it will call onReject()
     *  yourClass.next();
     *  yourClass.prev();
     * 
     *  // resolves the current state
     *  yourClass.resolve();
     *  ```
     */
    constructor(onChange, onClear, onReject) {
        /**
         * The states in the stack
         * @type {Array<State>}
         * @public
         */
        this.states = [];

        /**
         * The current state
         * @type {State}
         * @public
         */
        this.currentState = null;

        /**
         * The index of the current state
         * @type {Number}
         * @public
         */
        this.currentIndex = -1;

        /**
         * Whether or not the stack is locked
         * @type {Boolean}
         * @public
         */
        this.locked = false;

        /**
         * The state that the stack was merged from
         * @type {StateStack}
         * @public
         */
        this.mergeFrom = {};

        this.onChange = onChange || this.onChange;
        this.onClear = onClear || this.onClear;
        this.onReject = onReject || this.onReject;

        /**
         * The date the stack was created
         * @type {Date}
         * @public
         */
        this.created = new Date();
    }

    /**
     * 
     * @param {Any} state This can be anything, it will be passed to onChange()
     */
    addState(state) {
        state = new State(state);
        if (this.currentIndex < this.states.length - 1) {
            // remove all states after currentIndex
            this.states = this.states.splice(0, this.currentIndex + 1);

            this.states.push(state.copy());
            this.currentIndex = this.states.length - 1;
            this.currentState = this.states[this.currentIndex];
        } else {
            this.states.push(state.copy());
            this.currentIndex = this.states.length - 1;
            this.currentState = this.states[this.currentIndex];
        }

        this.resolve();
    }

    /**
     *  @description Destroys the stack and calls onClear()
     */
    clearStates() {
        this.states = [];
        this.currentIndex = -1;
        this.currentState = null;
        this.onClear();
    }

    /**
     * @description Goes to the next state in the stack
     */
    next() {
        if (this.states.length > 0 && this.currentIndex < this.states.length - 1) {
            this.currentState = this.states[this.currentIndex + 1];
            this.currentIndex++;

            this.resolve();
        } else {
            this.onReject(this.currentState.content);
        }
    }

    /**
     * @description Goes to the previous state in the stack
     */
    prev() {
        if (this.states.length > 0 && this.currentIndex > 0) {
            this.currentState = this.states[this.currentIndex - 1];
            this.currentIndex--;
            // this.findBranch(this.currentIndex);
            this.resolve();
        } else {
            this.onReject(this.currentState.content);
        }
    }

    /**
     * Goes to the last state in the stack
     */
    last() {
        if (this.states.length > 0) {
            this.currentIndex = this.states.length - 1;
            this.currentState = this.states[this.currentIndex];
            this.resolve();
        } else {
            this.onReject(this.currentState.content);
        }
    }

    /**
     * Goes to the first state in the stack
     */
    first() {
        if (this.states.length > 0) {
            this.currentIndex = 0;
            this.currentState = this.states[this.currentIndex];
            this.resolve();
        } else {
            this.onReject(this.currentState.content);
        }
    }

    /**
     * 
     * @param {Array[Any]} states The states to set the stack to 
     * @param {Number} index The index to set the current state to (defaults to the last state in the stack)
     */
    set(states, index) {
        if (!Array.isArray(states)) throw new Error('states must be an array');

        this.states = states.map(state => new State(state));
        if (isNaN(index)) index = this.states.length - 1;
        this.currentIndex = index;
        this.currentState = this.states[this.currentIndex];
        this.resolve();
    }

    /**
     * @description Gets the number of states in the current stack
     */
    get numStacks() {
        return this.states.length;
    }

    /**
     * @description Resolves the current state
     */
    resolve() {
        if (this.locked) {
            this.onReject(this.currentState.content);
        } else {
            this.onChange(this.currentState.content);
        }
    }

    /**
     *  @description Customizable callback for when the state changes
     */
    onChange() {

    }

    /**
     *  @description Customizable callback for when the state changes to a rejected state
     */
    onReject() {
        throw new Error('State does not exist, nothing has changed');
    }

    /**
     * @description Customizable callback for when the stack is cleared
     */
    onClear() {

    }

    get hasNext() {
        return this.currentIndex < this.states.length - 1;
    }

    get hasPrev() {
        return this.currentIndex > 0;
    }

    /**
     * 
     * @returns {String} JSON string of the stack
     */
    toJson() {
        return JSON.stringify({
            states: this.states.map(s => s.content),
            currentIndex: this.currentIndex
        });
    }

    /**
     * 
     * @param {String} json JSON string of the stack 
     * @returns {StateStack} New StateStack object
     */
    static fromJson(json) {
        const stack = new StateStack();
        const obj = JSON.parse(json);
        stack.set(obj.states, obj.currentIndex);
        return stack;
    }
}


/**
 * Stack of StateStacks
 * 
 */
class BranchStack {
    constructor() {
        this.branches = {};
        this.currentBranch = null;
        this.currentPointer = null;
    }

    /**
     * 
     * @param {StateStack} stack state-stack 
     * @param {String} title title of the state-stack
     * @public
     */
    newBranch(stack, title) {
        if (this.branches.title) {
            console.error('Branch already exists');
            return;
        }

        this.branches[title] = stack;
        this.currentBranch = stack;
        this.currentPointer = title;
        this.onChange(this.currentBranch);
    }

    /**
     * 
     * @param {String} title title of the state-stack
     * @public
     */
    deleteBranch(title) {
        if (this.currentBranch === this.branches[title]) throw new Error('Cannot delete current branch');

        if (this.currentPointer === title) {
            this.currentPointer = null;
            this.currentBranch = null;
        }
        delete this.branches[title];
    }

    get numStacks() {
        return Object.keys(this.branches).length;
    }

    /**
     * @description Creates a new state-stack and adds it to the current state-stack
     * @param {String} oldTitle old title of the state-stack
     * @param {String} newTitle new title of the state-stack
     * @public
     */
    copyBranch(oldTitle, newTitle) {
        this.branches[newTitle] = {...this.branches[oldTitle] };
    }

    /**
     * 
     * @param {String} title title of the state-stack
     * @public
     */
    goToBranch(title) {
        this.currentPointer = title;
        this.currentBranch = this.branches[title];
        this.onChange(this.currentBranch);
    }

    /**
     * Prevents the current state-stack from changing
     * @param {String} title title of the state-stack
     * @public 
     */
    lockBranch(title) {
        this.branches[title].locked = true;
    }

    /**
     * Allows the current state-stack to change
     * @param {String} title title of the state-stack
     * @public
     */
    unlockBranch(title) {
        this.branches[title].locked = false;
    }

    get locked() {
        return this.currentBranch.locked;
    }

    get numStacks() {
        return Object.keys(this.branches).length;
    }

    /**
     * Custom function for when the branch changes
     * @param {StateStack} branch state-stack 
     */
    onChange(branch) {
        try {
            branch.resolve();
        } catch (e) {
            throw new Error('Branch is not of type StateStack or does not exist');
        }
    }

    /**
     * Merge two states together
     * @param {Any} a 
     * @param {Any} b 
     * @returns {Any} merged state
     */
    static mergeStates(a, b) {
        const merge = (x, y) => {
            const isObject = obj => obj && typeof obj === 'object';

            if (!isObject(x) || !isObject(y)) {
                return y;
            }

            Object.keys(y).forEach(key => {
                const xVal = x[key];
                const yVal = y[key];

                if (Array.isArray(xVal) && Array.isArray(yVal)) {
                    x[key] = xVal.concat(...yVal);
                } else if (isObject(xVal) && isObject(yVal)) {
                    x[key] = merge(xVal, yVal);
                } else {
                    x[key] = yVal;
                }
            });

            return x;
        };

        if (typeof a !== typeof b) throw new Error('Cannot merge states of different types');
        if (typeof a === 'object') return merge(a, b);
        return b;
    }

    /**
     * Merging Branch Stacks (merge branchTitle1 into branchTitle2 to create new branch with title newTitle)
     * @param {String} branchTitle1 
     * @param {String} branchTitle2 
     * @param {String} newTitle
     */
    merge(branchTitle1, branchTitle2, newTitle) {
        // iterate through each state in title2 and compare it to title1
        // if it is the same, do nothing and move on
        // if it is different, revert title1 to the state in title2

        const branch1 = this.branches[branchTitle1];
        const branch2 = this.branches[branchTitle2];

        if (!branch1) throw new Error('Branch 1 does not exist');
        if (!branch2) throw new Error('Branch 2 does not exist');

        if (!Array.isArray(branch1.states)) throw new Error('Branch 1 is not of type StateStack');
        if (!Array.isArray(branch2.states)) throw new Error('Branch 2 is not of type StateStack');

        const newBranch = new StateStack();

        const newStates = branch2.states;
        newStates.push(this.mergeStates(
            branch1.currentState,
            branch2.currentState
        ));

        newBranch.states = newStates;
        newBranch.currentIndex = newStates.length - 1;
        newBranch.locked = false;
        newBranch.currentState = newStates[newBranch.currentIndex];
        newBranch.resolve();

        newBranch.mergeFrom = [branch1, branch2];

        this.lockBranch(branchTitle1);
        this.lockBranch(branchTitle2);

        this.newBranch(newBranch, newTitle);
    }

    /**
     * Renames a branch
     * @param {String} oldTitle 
     * @param {String} newTitle 
     */
    renameBranch(oldTitle, newTitle) {
        if (!this.branches[oldTitle]) throw new Error('Branch does not exist');
        this.branches[newTitle] = this.branches[oldTitle];
        delete this.branches[oldTitle];

        this.currentBranch = this.branches[newTitle];
        this.currentPointer = newTitle;
    }

    /**
     * 
     * @returns {String} JSON string of all branches
     */
    toJson() {
        return JSON.stringify(Object.keys(this.branches).map(title => {
            const branch = this.branches[title];
            return {
                title,
                states: branch.states,
                currentIndex: branch.currentIndex,
                locked: branch.locked,
                currentState: branch.currentState,
                mergeFrom: branch.mergeFrom
            };
        }));
    }

    /**
     * 
     * @param {String} json JSON string of all branches 
     * @returns {BranchStack} New BranchStack object
     */
    static fromJson(json) {
        const branchStack = new BranchStack();
        const branches = JSON.parse(json);

        branches.forEach(branch => {
            const newBranch = new StateStack();
            newBranch.states = branch.states;
            newBranch.currentIndex = branch.currentIndex;
            newBranch.locked = branch.locked;
            newBranch.currentState = branch.currentState;
            newBranch.mergeFrom = branch.mergeFrom;

            branchStack.newBranch(newBranch, branch.title);
        });

        return branchStack;
    }
}