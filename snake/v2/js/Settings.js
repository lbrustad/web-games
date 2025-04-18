import configs from './configs.js'

let config = configs[Math.floor(Math.random() * configs.length)];

const data = {
    settingsElement: null,
    styleElement: document.createElement('style')
}

function modifyGrid(el = data.styleElement, size = config.gridSize) {
    // el.textContent = `:root { --grid-size: ${size}; }`;
    document.body.style = `--grid-size: ${size}`;
}

export default class Settings {
    get element() {
        // The element must not be faulty
        const element = data.settingsElement;
        if (!(element instanceof HTMLElement)) {
            throw new Error(`The HTML element was not found.`)
        }
        return element;
    }

    get config() {
        return config;
    }

    get gridSize() {
        return config.gridSize;
    }

    get speed() {
        return config.speed;
    }

    get walls() {
        return config.speed;
    }

    constructor(element) {
        if (element == null || typeof element !== 'string') {
            throw new Error(`You have to set an element to manage. It must be a query selector string.`);
        }

        const selectedElement = document.querySelector(element);
        if (!(selectedElement instanceof HTMLElement)) {
            throw new Error(`Failed selecting element.`);
        }

        data.settingsElement = selectedElement;
        this.init();
    }

    init() {
        // Initialize styles
        modifyGrid();
        document.head.appendChild(data.styleElement);

        // initialize settings GUI
    }
}