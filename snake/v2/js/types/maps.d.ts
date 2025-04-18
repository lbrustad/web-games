export interface IPosition {
    row: number;
    column: number;
}

export type TWalls = number | IPosition[];

export interface IConfig {
    gridSize: number,
    speed: number,
    walls: TWalls,
    foodWorth: number
}