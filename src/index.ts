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
  	private readonly audio: HTMLAudioElement;

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
		`);

		this.startButton = getRef("startButton", HTMLButtonElement);
		this.stopButton = getRef("stopButton", HTMLButtonElement);
		this.deleteButton = getRef("deleteButton", HTMLButtonElement);
		this.saveButton = getRef("saveButton", HTMLButtonElement);

		// container.append(HTML);

	}

}
