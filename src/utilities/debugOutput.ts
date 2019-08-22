let container: HTMLDivElement = null;
const content: {[index: string]: string} = {};

export function initialize(_container: HTMLDivElement) {
    container = _container;
}

export function log(name: string, text: string) {
    content[name] = text;
}

export function print() {
    container.innerHTML = Object.keys(content).map(name => `<p>${name}: ${content[name]}</p>`).join('\n');
}