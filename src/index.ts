export interface VoiceNoteOptions {
	onRecord?: (blob: Blob) => void;
	onError?: (error: Error) => void;
}

export type VoiceNoteState = "idle" | "requesting" | "recording" | "stopping" | "destroyed";

export class VoiceNote {

	private readonly onRecord: VoiceNoteOptions["onRecord"];
  	private readonly onError: VoiceNoteOptions["onError"];
  	private currentState: VoiceNoteState = "idle";

	constructor(
		container: HTMLElement, 
		{
			onRecord, 
			onError
		}: VoiceNoteOptions = {}
	) {
    	
		this.onRecord = onRecord;
    	this.onError = onError;
		
	}

}
