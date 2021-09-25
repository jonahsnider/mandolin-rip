declare module 'm3u8-parser' {
	export interface Playlist {
		attributes: {
			'CLOSED-CAPTIONS': string;
			RESOLUTION: {
				width: number;
				height: number;
			};
			CODECS: string;
			'AVERAGE-BANDWIDTH': number;
			BANDWIDTH: number;
		};
		uri: string;
		timeline: number;
	}

	export interface Segment {
		dateTimeString: string;
		dateTimeObject: Date;
		duration: number;
		uri: string;
		timeline: number;
	}

	export interface Manifest {
		segments?: Segment[];
		playlists?: Playlist[];
	}

	export class Parser {
		manifest: Manifest;

		constructor();

		push(m3u8: string): void;

		end(): void;
	}
}
