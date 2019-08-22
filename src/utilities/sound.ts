export class Sound {
    private container: HTMLAudioElement;

    constructor(path: string) {
        this.container = document.createElement('audio');
        const source = document.createElement('source');
        source.src = path;
        this.container.appendChild(source);
    }

    get loop() {
        return this.container.loop;
    }

    set loop(value: boolean) {
        this.container.loop = value;
    }

    get volume() {
        return this.container.volume;
    }

    set volume(value: number) {
        this.container.volume = value;
    }

    play() {
        this.container.play();
    }
}