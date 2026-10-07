import $tmpl from "./tmpl.js";

export interface VoiceNoteOptions {
	onRecord?: (blob: Blob) => void;
	onError?: (error: Error) => void;
}

export type VoiceNoteState = "idle" | "requesting" | "recording" | "stopping" | "destroyed";

export class VoiceNote {

	private readonly onRecord: VoiceNoteOptions["onRecord"];
  	private readonly onError: VoiceNoteOptions["onError"];
  	private currentState: VoiceNoteState = "idle";
	private readonly startButton: HTMLButtonElement;
  	private readonly stopButton: HTMLButtonElement;
  	private readonly deleteButton: HTMLButtonElement;
  	private readonly saveButton: HTMLButtonElement;
	private readonly status: HTMLParagraphElement;
  	// private readonly audio: HTMLAudioElement;
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
		`);



		this.startButton = getRef("startButton", HTMLButtonElement);
		this.stopButton = getRef("stopButton", HTMLButtonElement);
		this.deleteButton = getRef("deleteButton", HTMLButtonElement);
		this.saveButton = getRef("saveButton", HTMLButtonElement);
		this.status = getRef("status", HTMLParagraphElement);

		this.handleStart = () => { void this.start(); };
    	this.handleStop = () => this.stop();
    	this.startButton.addEventListener("click", this.handleStart);
    	this.stopButton.addEventListener("click", this.handleStop);

		container.append(HTML);

		this.setState("idle", "Ready to record.");

	}

	private setState(state: VoiceNoteState, message: string): void {
		this.currentState = state;
		this.status.textContent = message;
		this.startButton.disabled = state !== "idle";
		this.stopButton.disabled = state !== "recording";
	}

	async start(): Promise<void> {
		console.log("start");
		if (this.state !== "idle") return;
    	this.setState("requesting", "Waiting for microphone permission…");
	}

	stop(): void {
		console.log("stop");
	}

}
