//import { IPosition, IConfig } from './types/maps';

/**
 * 
 * @param {number} gridSize
 * @returns {IPosition[]}
 */
function wallsAround(gridSize) {
    /**
     * @type {IPosition[]}
     */
    const walls = [];
    for (let row = 0; row < gridSize; row++) {
        for (let column = 0; column < gridSize; column++) {
            if (
                row === 0
                || row === gridSize - 1
                || column === 0
                || column === gridSize - 1
            ) {
                walls.push({
                    row,
                    column
                });
            }
        }
    }
    return walls;
}

/**
 * @type {IConfig[]}
 */
const config = [{
    gridSize: 15,
    speed: 6,
    walls: 14,
    foodWorth: 2
},
{
    gridSize: 19,
    speed: 10,
    walls: [],
    foodWorth: 2
},
{
    gridSize: 11,
    speed: 5,
    walls: [...(Math.random() > .4 ? wallsAround(11) : []),
        // top left
        { row: 2, column: 3 },
        { row: 3, column: 3 },
        { row: 3, column: 2 },
        // bottom left
        { row: 8, column: 3 },
        { row: 7, column: 3 },
        { row: 7, column: 2 },
        // top right
        { row: 2, column: 7 },
        { row: 3, column: 7 },
        { row: 3, column: 8 },
        // bottom right
        { row: 8, column: 7 },
        { row: 7, column: 7 },
        { row: 7, column: 8 }
    ],
    foodWorth: 1
},
{
    gridSize: 11,
    speed: 5,
    walls: [...(Math.random() > .4 ? wallsAround(11) : []),
        // top left
        { row: 2, column: 4 },
        { row: 3, column: 4 },
        { row: 4, column: 4 },
        { row: 4, column: 3 },
        { row: 4, column: 2 },
        // bottom left
        { row: 8, column: 4 },
        { row: 7, column: 4 },
        { row: 6, column: 4 },
        { row: 6, column: 3 },
        { row: 6, column: 2 },
        // top right
        { row: 2, column: 6 },
        { row: 3, column: 6 },
        { row: 4, column: 6 },
        { row: 4, column: 7 },
        { row: 4, column: 8 },
        // bottom right
        { row: 8, column: 6 },
        { row: 7, column: 6 },
        { row: 6, column: 6 },
        { row: 6, column: 7 },
        { row: 6, column: 8 }
    ],
    foodWorth: 1
}];

export default config;