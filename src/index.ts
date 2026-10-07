import $tmpl from "./tmpl.js";
import { AudioVisualizer } from "./audioVisualizer.js";

export interface VoiceNoteOptions {
	onRecord?: (blob: Blob) => void;
	onError?: (error: Error) => void;
}

export type VoiceNoteState = "idle" | "requesting" | "recording" | "stopping" | "destroyed";

export class VoiceNote {

	private readonly onRecord: VoiceNoteOptions["onRecord"];
  	private readonly onError: VoiceNoteOptions["onError"];
  	
	private currentState: VoiceNoteState = "idle";
	private stream: MediaStream | null = null;
	private recorder: MediaRecorder | null = null;
	private readonly audioVisualizer: AudioVisualizer;
	private readonly visualizer: HTMLCanvasElement;

	private readonly startButton: HTMLButtonElement;
  	private readonly stopButton: HTMLButtonElement;
  	private readonly deleteButton: HTMLButtonElement;
  	private readonly saveButton: HTMLButtonElement;
	private readonly status: HTMLParagraphElement;
  	private readonly audio: HTMLAudioElement;
	private url: string | null = null;

	private readonly handleStart: () => void;
  	private readonly handleStop: () => void;

	get state(): VoiceNoteState {
		return this.currentState;
	}

	private isDestroyed(): boolean {
		return this.currentState === "destroyed";
	}

	constructor(
		container: HTMLElement, 
		{
			onRecord, 
			onError
		}: VoiceNoteOptions = {}
	) {
    	
		this.onRecord = onRecord;
    	this.onError = onError;

		let { HTML, getRef } = $tmpl(`
			<button type="button" ref="startButton">
				Record
			</button>
			<button type="button" ref="stopButton">
				Stop
			</button>
			<button type="button" ref="deleteButton">
				Delete
			</button>
			<button type="button" ref="saveButton">
				Save
			</button>
			<p ref="status"></p>
			<canvas ref="visualizer" width="640" height="120" hidden
				role="img" aria-label="Live microphone volume: taller bars mean louder audio"
				style="width: 100%; max-width: 640px; height: 120px; border-radius: 8px;"></canvas>
		`);

		this.audio = document.createElement("audio");
    	this.audio.controls = true;
    	this.audio.hidden = true;
		HTML.appendChild(this.audio);

		this.startButton = getRef("startButton", HTMLButtonElement);
		this.stopButton = getRef("stopButton", HTMLButtonElement);
		this.deleteButton = getRef("deleteButton", HTMLButtonElement);
		this.saveButton = getRef("saveButton", HTMLButtonElement);
		this.status = getRef("status", HTMLParagraphElement);
		this.visualizer = getRef("visualizer", HTMLCanvasElement);
		this.audioVisualizer = new AudioVisualizer(this.visualizer);

		this.handleStart = () => { void this.start(); };
    	this.handleStop = () => this.stop();
    	this.startButton.addEventListener("click", this.handleStart);
    	this.stopButton.addEventListener("click", this.handleStop);

		container.append(HTML);

		this.setState("idle", "Ready to record.");

	}

	/**
	 * Updates the current state and reflects it in the UI.
	 *
	 * @param state - The new lifecycle state.
	 * @param message - The status text shown to the user.
	 * @returns Nothing.
	 */
	private setState(state: VoiceNoteState, message: string): void {
		this.currentState = state;
		this.status.textContent = message;
		this.startButton.disabled = state !== "idle";
		this.stopButton.disabled = state !== "recording";
	}

	/**************************************************
	 * Starts a microphone recording session if the app is idle.
	 *
	 * @returns A promise that resolves when recording has been started or failed.
	**************************************************/
	async start(): Promise<void> {
		
		console.log("start");
		
		if (this.state !== "idle") return;
    	this.setState("requesting", "Waiting for microphone permission…");

		 try {
			
			if (
				!globalThis.navigator?.mediaDevices?.getUserMedia ||
				typeof globalThis.MediaRecorder !== "function"
			) {
				throw new Error("Recording requires a supported browser on HTTPS or localhost.");
			}

			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			if (this.isDestroyed()) {
				stream.getTracks().forEach(track => track.stop());
				return;
			}

			this.stream = stream;
			const recorder = new MediaRecorder(stream);
			this.recorder = recorder;
			const chunks: Blob[] = [];

			recorder.ondataavailable = (event) => {
				if (event.data.size > 0) chunks.push(event.data);
			};

			recorder.onerror = (event) => {
				const error = "error" in event ? event.error : new Error("Recording failed.");
				this.fail(error);
			};

			recorder.onstop = () => {
				if (this.state === "destroyed" || this.recorder !== recorder) return;
				const blob = new Blob(chunks, { type: recorder.mimeType });
				this.releaseMicrophone();
				this.clearPlayback();
				this.url = URL.createObjectURL(blob);
				this.audio.src = this.url;
				this.audio.hidden = false;
				this.setState("idle", "Recording ready to play.");
				this.onRecord?.(blob);
			};
			
			recorder.start();
			this.setState("recording", "Recording…");
			this.audioVisualizer.start(stream);
			
		} catch (error) {
			if (!this.isDestroyed()) this.fail(error);
		}

	}


	/**************************************************
	 * Stops the active recording and finalizes the captured audio.
	 *
	 * @returns Nothing.
	**************************************************/
	stop(): void {
		
		console.log("stop");
		if (this.state !== "recording" || !this.recorder) return;
    	this.setState("stopping", "Finishing recording…");
		this.audioVisualizer.stop();
    	this.recorder.stop();
    	this.stream?.getTracks().forEach(track => track.stop());

	}

	/**************************************************
	 * Handles a recording failure by releasing the microphone, resetting the UI,
	 * and notifying the caller through the error callback.
	 *
	 * @param error - The error that caused the recording to fail.
	 * @returns Nothing.
	**************************************************/
	private fail(error: unknown): void {
		
		this.releaseMicrophone();
		const failure = error instanceof Error ? error : new Error(String(error));
		this.setState("idle", failure.message);
		this.onError?.(failure);

  	}

	/**************************************************
	 * Releases the current microphone stream and recorder, stopping any active
	 * recording and clearing their event handlers.
	 *
	 * @returns Nothing.
	**************************************************/
	private releaseMicrophone(): void {
		
		if (this.recorder) {
			this.recorder.ondataavailable = null;
			this.recorder.onstop = null;
			this.recorder.onerror = null;
			if (this.recorder.state !== "inactive") this.recorder.stop();
			this.recorder = null;
		}
		
		this.audioVisualizer.stop();
		this.stream?.getTracks().forEach(track => track.stop());
		this.stream = null;

	}

	/**************************************************
	 * Stops playback, clears the current audio source, hides the audio
	 * element, and releases the object URL for the previous recording.
	 *
	 * @returns Nothing.
	**************************************************/
	private clearPlayback(): void {
		
		this.audio.pause();
		this.audio.removeAttribute("src");
		this.audio.load();
		this.audio.hidden = true;
		if (this.url) URL.revokeObjectURL(this.url);
		this.url = null;

	}

}


