import Controls from './Controls.js';
import Game from './Game.js';
import Settings from './Settings.js';

const settings = new Settings('#settings')
const game = new Game('#game')
const controls = new Controls('#controls')

game.init(settings);
controls.init(game, settings);

window.s = settings;
window.g = game;