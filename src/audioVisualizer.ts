/** Draw microphone levels on a canvas and manage the associated audio resources. */
export class AudioVisualizer {
	
	private audioContext: AudioContext | null = null;
	private microphoneSource: MediaStreamAudioSourceNode | null = null;
	private animationFrame: number | null = null;

	constructor(private readonly canvas: HTMLCanvasElement) {}

	start(stream: MediaStream): void {

		this.stop();

		if (typeof globalThis.AudioContext !== "function") return;

		try {

			const drawing = this.canvas.getContext("2d");
			if (!drawing) return;
			
			const context = new AudioContext();
			this.audioContext = context;
			
			const analyser = context.createAnalyser();
			analyser.fftSize = 1024;
			
			this.microphoneSource = context.createMediaStreamSource(stream);
			this.microphoneSource.connect(analyser);
			
			const samples = new Uint8Array(analyser.fftSize);
			const levels = new Array<number>(64).fill(0);
			let lastSample = -Infinity;
			let smoothedLevel = 0;
			this.canvas.hidden = false;
			
			void context.resume().catch(() => {
				if (this.audioContext === context) this.stop();
			});

			const draw = (time: number) => {

				if (this.audioContext !== context) return;
				
				if (time - lastSample >= 40) {
					lastSample = time;
					analyser.getByteTimeDomainData(samples);
					let sum = 0;
					for (const sample of samples) {
						const amplitude = (sample - 128) / 128;
						sum += amplitude * amplitude;
					}
					const level = Math.min(1, Math.sqrt(sum / samples.length) * 4);
					smoothedLevel = Math.max(level, smoothedLevel * 0.75);
					levels.shift();
					levels.push(smoothedLevel);
					const { width, height } = this.canvas;
					drawing.fillStyle = "#0f172a";
					drawing.fillRect(0, 0, width, height);
					drawing.fillStyle = "#38bdf8";
					levels.forEach((volume, index) => {
						const barHeight = Math.max(2, volume * (height - 16));
						drawing.fillRect(index * 10 + 2, (height - barHeight) / 2, 6, barHeight);
					});
				}

				this.animationFrame = requestAnimationFrame(draw);

			};

			this.animationFrame = requestAnimationFrame(draw);

		} catch {
			this.stop();
		}

	}

	stop(): void {
		
		if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
		this.animationFrame = null;
		this.microphoneSource?.disconnect();
		this.microphoneSource = null;
		if (this.audioContext) void this.audioContext.close().catch(() => {});
		this.audioContext = null;
		this.canvas.hidden = true;

	}
	
}

