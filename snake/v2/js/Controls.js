import Game from './Game.js';
import Settings from './Settings.js';

const data = {
    controlElement: null
}

export default class Controls {
    constructor(element) {
        if (element == null || typeof element !== 'string') {
            throw new Error(`You have to set an element to manage. It must be a query selector string.`);
        }

        const selectedElement = document.querySelector(element);
        if (!(selectedElement instanceof HTMLElement)) {
            throw new Error(`Failed selecting element.`);
        }

        data.controlElement = selectedElement;
    }

    get element() {
        // The element must not be faulty
        const element = data.controlElement;
        if (!(element instanceof HTMLElement)) {
            throw new Error(`The HTML element was not found.`)
        }
        return element;
    }

    init(game, settings) {
        if (!(game instanceof Game) || !(settings instanceof Settings)) {
            throw new Error(`Failed initializing the controls`);
        }

        window.addEventListener('keydown', e => {
            switch (e.key) {
                case "ArrowUp":
                case "w":
                    game.setDirection('up');
                    e.preventDefault();
                    break;
                case "ArrowRight":
                case "d":
                    game.setDirection('right');
                    e.preventDefault();
                    break;
                case "ArrowDown":
                case "s":
                    game.setDirection('down');
                    e.preventDefault();
                    break;
                case "ArrowLeft":
                case "a":
                    game.setDirection('left');
                    e.preventDefault();
                    break;
                case "r":
                    e.preventDefault();
                    if (game.alive) break;
                    game.restart();
                default:
                    game.setDirection('pause');
            }
        });
        game.start(settings.speed);

        this.element.addEventListener('click', e => {
            game.restart();
        });
    }
}