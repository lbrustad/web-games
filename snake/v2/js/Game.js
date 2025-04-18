import Settings from './Settings.js'
import Util from "./Util.js";
import constants from './constants.js'

const data = {
    // snake objects
    snake: [{
        row: -1,
        column: -1
    }],

    // is alive
    alive: false,

    // last render time
    lastRenderTime: -1,

    // game movement speed
    gameSpeed: 1,

    // wall positions
    walls: [{
        row: 3,
        column: 3
    }],

    // the element were the game is
    gameElement: null,

    // the grid height/width
    gridSize: -1,

    // points/snake length
    currentLength: 4,

    // end game when maxed out
    maxLengthReached: false,

    // the food position
    foodPosition: {
        row: -1,
        column: -1
    },
    minimumPossiblePositions: 2,

    // move direction
    direction: {
        current: 'pause',
        next: 'pause'
    },

    // possible directions
    directions: {
        vertical: ['up', 'down'],
        horizontal: ['right', 'left']
    },

    // settings
    settings: null
};

const copyOfData = Object.assign({}, data)

// access to data from the console while developing
window.data = data;

// the Game class which handles everything based on the settings
export default class Game {
    constructor(element) {
        // test the usage of the class to prevent errors
        if (element == null || typeof element !== 'string') {
            throw new Error(`You have to set an element to manage. It must be a query selector string.`);
        }

        // verify that the usage works properly
        const selectedElement = document.querySelector(element);
        if (!(selectedElement instanceof HTMLElement)) {
            throw new Error(`Failed selecting element.`);
        }

        // store the game element
        data.gameElement = selectedElement;

        this.loop = this.loop.bind(this);
    }

    // get the game element
    get element() {
        // The element must not be faulty
        const element = data.gameElement;
        if (!(element instanceof HTMLElement)) {
            throw new Error(`The HTML element was not found.`)
        }
        return element;
    }

    get settings() {
        if (!(data.settings instanceof Settings)) {
            return null;
        }
        return data.settings.config;
    }

    get alive() {
        return data.alive;
    }

    // initialize the game
    init(settings) {
        if (!(settings instanceof Settings) && !(data.settings instanceof Settings)) {
            throw new Error(`This method requires a Settings object as a parameter`);
        }
        const { CELL, SNAKE, FOOD, WALL } = constants.CSS_CLASS_NAME;

        // prepare data
        if (!this.settings) {
            data.settings = settings;
        }
        const { gridSize, walls } = this.settings;
        data.gridSize = gridSize;
        const center = Math.floor(gridSize / 2);
        data.snake = [{
            row: center,
            column: center
        }];

        // add walls
        data.walls = walls;
        if (typeof walls === 'number') {
            data.walls = [];
            this.addRandomWalls(walls);
        }

        // set a random food position
        this.setFoodPosition(true);
        const { foodPosition } = data;

        // generate HTML
        const element = this.element;
        element.innerHTML = '';
        console.time('Generate game-grid');
        for (let row = 0; row < gridSize; row++) {
            for (let column = 0; column < gridSize; column++) {
                // create a cell element and append it
                const columnElement = document.createElement('div');
                columnElement.className = CELL;
                element.appendChild(columnElement);

                // check and add the snake class/element
                if (row === center && column === center) {
                    columnElement.classList.add(SNAKE);
                    continue;
                }

                // check and add the food class/element
                if (foodPosition.row === row && foodPosition.column === column) {
                    columnElement.classList.add(FOOD);
                    continue;
                }

                // check and add the wall class/element
                if (Util.matchPositions(data.walls, { row, column })) {
                    columnElement.classList.add(WALL);
                    continue;
                }
            }
        }
        console.timeEnd('Generate game-grid');
    }

    // generate a random set of wall positions
    addRandomWalls(length = 0) {
        const walls = [];

        // keep going till the set length is correct
        while (walls.length < length) {
            const wall = {
                row: Math.floor(Math.random() * data.gridSize),
                column: Math.floor(Math.random() * data.gridSize)
            }

            // verify that the position is an empty position
            if (walls.some(({ row, column }) => wall.row === row && wall.column === column)) continue;
            if (data.snake.some(({ row, column }) => wall.row === row && wall.column === column)) continue;

            walls.push(wall);
        }

        // set the data value
        data.walls = walls;
    }

    // move the snake
    move() {
        const { DEATH_MESSAGE } = constants.END_GAME_MESSAGE;
        const { gridSize, snake } = data;
        const snakeHead = Util.copy(snake[0]);
        const direction = data.direction.next;
        data.direction.current = direction;

        // create the new head position
        switch (direction) {
            case 'up':
                snakeHead.row -= 1
                if (snakeHead.row === -1) snakeHead.row = gridSize-1;
                break;
            case 'right':
                snakeHead.column += 1
                if (snakeHead.column === gridSize) snakeHead.column = 0;
                break;
            case 'down':
                snakeHead.row += 1
                if (snakeHead.row === gridSize) snakeHead.row = 0;
                break;
            case 'left':
                snakeHead.column -= 1
                if (snakeHead.column === -1) snakeHead.column = gridSize-1;
                break;
            default:
                console.log('paused');
                return;
        }

        // make changes to the data
        data.snake.unshift(snakeHead);
        const removeFromTail = [];
        while (data.snake.length > data.currentLength) {
            removeFromTail.push(data.snake.pop());
        }

        // try to eat the apple and update
        this.eatApple();
        this.update(removeFromTail);

        // check death
        const [deathReason, didDie] = this.checkDeath();
        if (didDie) {
            data.alive = false;
            this.setDirection('pause');
            console.log(Util.insertText(DEATH_MESSAGE, snake.length, deathReason));
            return;
        }
    }

    // update the UI with the new data
    update(removeFromTail) {
        const { SNAKE, TAIL } = constants.CSS_CLASS_NAME;

        // get positions
        const { snake } = data;
        const [newHead, oldHead] = snake;

        // remove classes from earlier tail
        for (const position of removeFromTail) {
            const tailElement = Util.gridCell(this.element, position);
            if (!(tailElement instanceof HTMLElement)) continue;
            tailElement.classList.remove(SNAKE, TAIL);
        }

        // change last head element to tail
        const oldHeadElement = Util.gridCell(this.element, oldHead);
        if (oldHeadElement instanceof HTMLElement) {
            oldHeadElement.classList.replace(SNAKE, TAIL);
        }

        // set the class for the new head
        const newHeadElement = Util.gridCell(this.element, newHead);
        if (newHeadElement instanceof HTMLElement) {
            newHeadElement.classList.add(SNAKE);
        }
    }

    // eat apple and set the apple to a new location
    eatApple() {
        const { FOOD } = constants.CSS_CLASS_NAME;
        const { foodPosition, snake } = data;
        const [ head ] = snake;

        // eat apple if possible
        if (foodPosition.row === head.row && foodPosition.column === head.column) {
            // increase points/snake length
            data.currentLength += this.settings.foodWorth;

            // remove the old food element
            const oldFoodElement = Util.gridCell(this.element, foodPosition);
            if (oldFoodElement instanceof HTMLElement) {
                oldFoodElement.classList.remove(FOOD);
            }

            // set the new food element
            this.setFoodPosition();
            const newFoodElement = Util.gridCell(this.element, data.foodPosition);
            if (newFoodElement instanceof HTMLElement) {
                newFoodElement.classList.add(FOOD);
            }
        }
    }

    // find and set a new valid food position
    setFoodPosition(initializing = false) {
        const { SNAKE, TAIL, WALL } = constants.CSS_CLASS_NAME;
        const { WIN_MESSAGE } = constants.END_GAME_MESSAGE;
        const { snake, walls, gridSize, minimumPossiblePositions } = data;

        // look for possible new food locations
        const regex = new RegExp(`${SNAKE}|${TAIL}|${WALL}`);
        let possibilitiesLeft = 0;
        for (let child of [...this.element.children]) {
            possibilitiesLeft += !regex.test(child.className);
        }

        if (possibilitiesLeft.length <= minimumPossiblePositions && !initializing) {
            // end game
            data.alive = false;
            this.setDirection('pause');
            console.log(Util.insertText(WIN_MESSAGE, snake.length, minimumPossiblePositions));
            return;
        }

        // find a new valid food location
        let [ position ] = snake;
        while (Util.matchPositions(snake, position) || Util.matchPositions(walls, position)) {
            position = {
                row: Math.floor(Math.random() * gridSize),
                column: Math.floor(Math.random() * gridSize)
            }
        }

        data.foodPosition = position;
    }

    // check if the player died
    checkDeath() {
        // get constants
        const { TRIED_EATING_TAIL, HEAD_MEET_WALL, OUT_OF_MAP } = constants.END_GAME_MESSAGE;

        // get grid size and walls
        const { gridSize, walls } = data;

        // get head and tail
        const [head, ...tail] = data.snake;

        // check if head position matches any tail position
        if (tail.some(({row, column}) => head.row === row && head.column === column)) return [TRIED_EATING_TAIL, true];

        // check if head position matches any wall position
        if (walls.some(({row, column}) => head.row === row && head.column === column)) return [HEAD_MEET_WALL, true];

        // check if head is outside the map
        if (head.column < 0 || head.column > gridSize || head.row < 0 || head.row > gridSize) return [OUT_OF_MAP, true];

        // something went wrong
        if (isNaN(data.currentLength)) return [`I'm sorry, but your current length is now not a number`, true];

        // it's safe to say that the snake is still breathing
        return [null, false];
    }

    setDirection(direction) {
        const { horizontal, vertical } = data.directions;
        const { current } = data.direction;
        if (direction === current) {
            data.direction.next = direction;
            return;
        }

        if (horizontal.includes(direction) && !horizontal.includes(current)) {
            data.direction.next = direction;
            return;
        }

        if (vertical.includes(direction) && !vertical.includes(current)) {
            data.direction.next = direction;
            return;
        }

        if (data.alive) return;
        data.direction.next = 'pause';
    }

    loop(currentTime) {
        if (!data.alive) return;
        window.requestAnimationFrame(this.loop);

        if (data.direction.next === 'pause') return;

        const secondsSinceLastRender = (currentTime - data.lastRenderTime) / 1000;
        if (secondsSinceLastRender < 1 / data.gameSpeed) return;

        data.lastRenderTime = currentTime;
        this.move();
    }

    start(speed) {
        // prepare everything
        this.setDirection('pause')
        data.alive = true;
        data.gameSpeed = speed;

        // start the game
        window.requestAnimationFrame(this.loop);
    }

    restart() {
        this.init(data.settings);
        data.currentLength = 4;
        data.direction.current = 'pause';
        this.start(this.settings.speed);
    }
}