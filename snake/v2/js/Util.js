export default class Util {
    static copy(value) {
        if (typeof value === 'string' || typeof value === 'number') {
            return value;
        }

        if (Array.isArray(value)) {
            return Object.assign([], value);
        }

        if (typeof value === 'object') {
            return Object.assign({}, value);
        }

        return JSON.parse( JSON.stringify(value) );
    }

    static gridCell(container, {row, column}) {
        if (!(container instanceof HTMLElement)) return;

        const size = Math.sqrt(container.childElementCount);
        return container.childNodes.item(size * row + column);
    }

    static matchPositions(positionArray, position) {
        return positionArray.some(({ row, column }) => position.row === row && position.column === column);
    }

    static insertText(inputString = '', ...text) {
        return inputString.replace(/%s/g, value => text.shift())
    }
}