/**
 * MemGame - Lasse Brustad's version, based on content from Anarox
 *
 * A Cheaters Memory Game, Unbeatable Anti-Cheat System
 *
 * Let me know if you can break the game, by just scripting in DevTools!
 */

/**
 * A card object to easily manage cards when created
 */
const Card = class {
    locked = false;
    revealed = false;
    hover = false;

    /**
     * A card object to easily manage cards when created
     * @param {string} image
     * @param {GameManager} manager
     */
    constructor(image, manager) {
        const self = this;

        // Store the card Base64 encoded image
        self.image = image;
        self.manager = manager;

        // Create the element of this card
        const element = document.createElement('img');
        element.alt = 'card';
        self.element = element;
        self.setHidden();

        // Events to validate if the mouse is hovering. This will prevent script based automation
        element.addEventListener('mouseenter', e => {
            this.hover = true;
        });
        element.addEventListener('mouseover', e => {
            this.hover = true;
        });
        element.addEventListener('mouseleave', e => {
            this.hover = false;
        });

        // The click event, this is where everything happens
        element.addEventListener('click', e => {
            e.preventDefault();

            if (manager.paused || this.locked || this.revealed || !this.hover) {
                return;
            }

            const revealedCard = manager.getRevealedCard();
            this.setRevealed();

            if (!revealedCard) {
                return;
            }

            const timeout = 500;
            manager.paused = true;
            setTimeout(this.tryMatchCards, timeout, this, revealedCard);
        });
    }

    // Hide the image and set as unrevealed
    setHidden() {
        if (!this.locked) {
            this.revealed = false;
            this.element.src = 'images/blank.png';
        }
    }

    // Reveal image and set revealed
    setRevealed() {
        if (!this.locked) {
            this.revealed = true;
            this.element.src = this.image;
        }
    }

    // Lock card and disable interactions
    setLocked() {
        this.revealed = false;
        this.locked = true;
        this.element.src = 'images/white.png';
    }

    /**
     * @param {Card} cardA
     * @param {Card} cardB
     */
    tryMatchCards(cardA, cardB) {
        const manager = cardA.manager;

        if (cardA.image !== cardB.image) {
            cardA.setHidden();
            cardB.setHidden();
            manager.subtractScore(5);
            manager.paused = false;
            return
        }

        cardA.setLocked();
        cardB.setLocked();
        manager.addScore(10);

        manager.checkEndgame(manager);
    }
}

/**
 * The game manager, this is where the magic happens
 */
const GameManager = class {
    // Score, hiscore and difficulty
    data = {
        score: 0,
        hiscore: 0,
        difficulty: 10
    };

    paused = true;

    constructor() {
        const self = this;

        // Available cards
        const cards = Object.freeze([
            'beer',
            'cheeseburger',
            'fries',
            'hotdog',
            'ice-cream',
            'milkshake',
            'pizza',
            'point-coin',
            'rice',
            'sushi'
        ]);
        self.cards = cards;

        // set to highest difficulty
        this.data.difficulty = cards.length;

        /** Separate setup from generating content **/

        // Game container, the element to contain everything
        const container = document.createElement('div');
        container.classList.add('container');

        // Heading text
        const title = document.createElement('h1');
        title.textContent = '== MemGame ==';
        self.container = container;
        container.appendChild(title);

        // The game board, which is where cards are displayed
        const gameBoard = document.createElement('div');
        gameBoard.id = 'gameboard';
        self.gameBoard = gameBoard;
        container.appendChild(gameBoard);

        // Score and hiscore element, displaying the current score and the hiscore
        self.scoreElement = this.createScoreElement('Score: ', this.data.score);
        self.hiscoreElement = this.createScoreElement('Hiscore: ', this.data.hiscore);

        // Finally, create the game!
        this.firstStart();
    }

    createScoreElement(textContent, value) {
        const scoreElement = document.createElement('h2');
        scoreElement.textContent = textContent;
        this.container.appendChild(scoreElement);

        const valueElement = document.createElement('span');
        valueElement.textContent = value;
        scoreElement.appendChild(valueElement);

        return valueElement;
    }

    async firstStart() {
        this.images = {};

        for (const name of this.cards) {
            const res = await fetch(`img/${name}.png.base64.txt`);
            const data = await res.text();
            this.images[name] = data;
        }

        this.startGame(this);
    }

    /** @param {GameManager} manager */
    startGame(manager) {
        /** Reset values and create the cards **/

        // Update hiscore
        manager.setHiscore();

        // Reset score
        manager.subtractScore(manager.data.score);

        // Creating the cards and storing the element references for injection into the game
        /** @type {Card[]} */
        const elementHandlers = [];
        for (const card of [...manager.cards.slice(0, manager.data.difficulty)]) {
            elementHandlers.push(
                new Card(manager.images[card], manager),
                new Card(manager.images[card], manager)
            );
        }
        manager.elementHandlers = elementHandlers;

        // Get the elements from the handlers and shuffle it into the gameboard
        const elements = elementHandlers.map(card => card.element);
        manager.gameBoard.replaceChildren(...manager.shuffle(elements));

        // Enable click events
        manager.paused = false;
    }

    /**
     * @param {GameManager} manager
     * @param {number} num
     */
    setDifficulty(manager, num) {
        const min = 5;
        const max = manager.cards.length;

        if (num >= min && num <= max) {
            manager.data.difficulty = num;
            manager.data.score = 0;
            manager.startGame(manager);
            return;
        }

        console.log(`Minimum ${min}, maximum ${max}`);
    }

    /** @param {any[]} arr */
    shuffle(arr) {
        return [...arr].sort(() => Math.random() - .5);
    }

    getRevealedCard() {
        const handlers = this.elementHandlers.filter(handler => handler.revealed);
        if (handlers.length == 1) {
            return handlers[0];
        }
    }

    /** @param {GameManager} manager */
    checkEndgame(manager) {
        const handlers = manager.elementHandlers.filter(handler => !handler.locked);
        if (handlers.length === 0) {
            setTimeout(manager.startGame, 1500, manager);
            return;
        }

        manager.paused = false;
    }

    /** @param {number} num */
    addScore(num) {
        this.data.score += num;
        this.scoreElement.textContent = this.data.score;
    }

    /** @param {number} num */
    subtractScore(num) {
        this.data.score -= Math.min(this.data.score, num);
        this.scoreElement.textContent = this.data.score;
    }

    setHiscore() {
        this.data.hiscore = Math.max(this.data.hiscore, this.data.score);
        this.hiscoreElement.textContent = this.data.hiscore;
    }

    getElement() {
        return this.container;
    }
}

/**
 * The game, a complex HTML element with completely isolated data
 */
const Game = class extends HTMLElement {
    constructor() {
        super();
        // The shadow element, the second layer of isolation
        const shadow = this.attachShadow({ mode: 'closed' });

        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = 'css/styles.css';
        shadow.appendChild(styles);

        // The game manager isolated into this class, third layer of isolation
        const game = new GameManager();
        shadow.appendChild(game.getElement());

        /* @param {number} num */
        // window.setDifficulty = (num) => game.setDifficulty(game, num);

        // Check if the player is within the game, otherwise, hide any content

        function replaceBody() {
            const html = document.getElementsByTagName('html')[0];
            const originalBody = document.body;
            const altBody = document.createElement('body');

            altBody.addEventListener('mouseenter', e => {
                html.replaceChild(originalBody, altBody);
            });
            altBody.addEventListener('mouseover', e => {
                html.replaceChild(originalBody, altBody);
            });

            html.replaceChild(altBody, originalBody);
        }
        document.body.addEventListener('mouseleave', replaceBody);
        document.body.addEventListener('blur', replaceBody);

        // Detect DevTools Open
        // !function() {
        //     function detectDevTool(allow) {
        //         if(isNaN(+allow)) allow = 100;
        //         var start = +new Date(); // Validation of built-in Object tamper prevention.
        //         debugger;
        //         var end = +new Date(); // Validates too.

        //         if(isNaN(start) || isNaN(end) || end - start > allow) {
        //             // input your code here when devtools detected.
        //             if (appended) {
        //                 shadow.removeChild(game.getElement());
        //                 appended = false;
        //             }
        //             return;
        //         }
        //         shadow.appendChild(game.getElement());
        //         appended = true;
        //     }

        //     if(window.attachEvent) {
        //         if (document.readyState === "complete" || document.readyState === "interactive") {
        //             detectDevTool();
        //             window.attachEvent('onresize', detectDevTool);
        //             window.attachEvent('onmousemove', detectDevTool);
        //             window.attachEvent('onfocus', detectDevTool);
        //             window.attachEvent('onblur', detectDevTool);
        //         } else {
        //             setTimeout(argument.callee, 0);
        //         }
        //     } else {
        //         window.addEventListener('load', detectDevTool);
        //         window.addEventListener('resize', detectDevTool);
        //         window.addEventListener('mousemove', detectDevTool);
        //         window.addEventListener('focus', detectDevTool);
        //         window.addEventListener('blur', detectDevTool);
        //     }
        // }();
    }
}

// Define the custom tag as an element using the constant class
customElements.define('game-manager', Game);
window.customElements.define = null;

// Replace gameboard with the game manager
const game = document.createElement('game-manager');
document.body.replaceChildren(game);