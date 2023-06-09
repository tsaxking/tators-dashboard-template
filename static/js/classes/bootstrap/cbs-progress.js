CustomBootstrap.ProgressBar = class ProgressBar extends CustomBootstrap.Element {
    constructor() {
        super();
        this.el = document.createElement('div');
        this.el.classList.add('d-flex', 'justify-content-space-between', 'align-items-center', 'mb-3', 'w-100', 'p-2', 'position-fixed', 'bg-secondary', 'rounded', 'text-light', 'opacity-9', 'animate__animated', 'animate__fadeInDown');
        this.el.style.zIndex = '98';

        this.text = document.createElement('p');
        this.text.classList.add('m-2');
        this.text.innerText = '0%';

        this.bar = document.createElement('div');
        this.bar.classList.add('progress-bar', 'progress-bar-striped', 'progress-bar-animated', 'progress-bar-primary', 'rounded', 'shadow');
        this.bar.setAttribute('role', 'progressbar');
        this.bar.setAttribute('aria-valuenow', '0');
        this.bar.setAttribute('aria-valuemin', '0');
        this.bar.setAttribute('aria-valuemax', '100');
        this.bar.style.width = '0%';
        this.bar.style.height = '24px';
        
        this.el.appendChild(this.text);
        this.el.appendChild(this.bar);

        // place at top of document.body
        document.querySelector('main').prepend(this.el);
    }

    get progress() {
        return +this.bar.getAttribute('aria-valuenow') / +this.bar.getAttribute('aria-valuemax');
    }

    set progress(value) {
        if (isNaN(value)) throw new Error('Progress must be a number, received: ' + value);
        if (value < 0 || value > 100) throw new Error('Progress must be between 0 and 100, received: ' + value);

        this.bar.setAttribute('aria-valuenow', value);
        this.bar.style.width = `${value}%`;
        this.text.innerText = `${value}%`;
    }

    destroy() {
        this.el.classList.remove('animate__fadeInDown');
        this.el.classList.add('animate__fadeOutUp');
        this.el.onanimationend = () => this.el.remove();
    }
}