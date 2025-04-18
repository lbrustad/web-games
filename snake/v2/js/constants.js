const constants = Object.freeze({
    // CSS class names used in code
    CSS_CLASS_NAME: Object.freeze({
        CELL: 'cell',
        SNAKE: 'snake',
        TAIL: 'tail',
        WALL: 'wall',
        FOOD: 'food'
    }),

    // end game messages
    END_GAME_MESSAGE: Object.freeze({
        DEATH_MESSAGE: 'You died with a score of %s. Reason: %s.',
        WIN_MESSAGE: 'You won with a score of %s. Reason: less than %s empty positions left.',
        TRIED_EATING_TAIL: 'tried eating tail',
        HEAD_MEET_WALL: 'head meets wall',
        OUT_OF_MAP: 'out of map'
    })
});

export default constants;