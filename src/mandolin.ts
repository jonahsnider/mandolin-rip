import fs from 'node:fs';
import path from 'node:path';
import {URL} from 'node:url';
import {pipeline} from 'node:stream/promises';
import consola from 'consola';
import type {Opaque} from 'type-fest';
import got from 'got';
import {Parser as M3u8Parser} from 'm3u8-parser';
import type {Nullish} from '@jonahsnider/util';
import {Sort} from '@jonahsnider/util';

import {BASE_DOWNLOADS_DIR} from './constants.js';

export interface StreamDetails {
	id: string;
	showId: string;
	isActive: boolean;
	publicLivestreamUrl: string;
	publicReplayUrl: string;
}

type M3u8 = Opaque<string, 'M3u8'>;

export class Mandolin {
	public readonly downloadDir;

	private readonly logger = consola.withTag(this.uuid);

	private readonly api = got.extend({
		prefixUrl: 'https://api.mandolin.com/v1/',

		headers: {Authorization: this.token},
		responseType: 'json',
	});

	/** Filenames that have been downloaded before. */
	private readonly downloadedClips = new Set<string>();

	constructor(private readonly uuid: string, private readonly token: string) {
		this.downloadDir = path.join(BASE_DOWNLOADS_DIR, uuid);

		if (!fs.existsSync(this.downloadDir)) {
			fs.mkdirSync(this.downloadDir, {recursive: true});
		}
	}

	public async fetchStreamDetails(): Promise<StreamDetails> {
		const response = await this.api<StreamDetails>(`show/streamDetails/${this.uuid}`);

		return response.body;
	}

	public async fetchLivestreamUrl(streamDetails?: StreamDetails | Nullish): Promise<URL> {
		const m3u8 = await this.fetchLivestreamRaw(streamDetails);

		return this.pickBestQuality(m3u8);
	}

	/** @returns An array of files downloaded. */
	public async download(m3u8?: M3u8 | Nullish): Promise<string[]> {
		m3u8 ??= await this.fetchLivestreamRaw();
		const snippetM3u8Url = this.pickBestQuality(m3u8);

		const {body: snippetM3u8} = await got<M3u8>(snippetM3u8Url.href);

		const parser = new M3u8Parser();

		parser.push(snippetM3u8);
		parser.end();

		if (!parser.manifest.segments) {
			throw new TypeError('No segments found');
		}

		const downloads: Array<Promise<void>> = [];
		const files = new Set<string>();

		for (const segment of parser.manifest.segments) {
			const fileName = this.filename(new URL(segment.uri));
			const filePath = path.join(this.downloadDir, fileName);

			if (this.downloadedClips.has(fileName)) {
				continue;
			}

			// Eagerly mark the file as downloaded
			this.downloadedClips.add(fileName);

			files.add(fileName);

			const promise = pipeline(got.stream(segment.uri), fs.createWriteStream(filePath));

			// If an error occurs while downloading, remove the file from the list of downloaded files
			promise.catch(error => {
				this.downloadedClips.delete(fileName);
				files.delete(fileName);

				this.logger.withTag(fileName).error(error);
			});

			downloads.push(promise);
		}

		await Promise.all(downloads);

		return [...files];
	}

	private async fetchLivestreamRaw(streamDetails?: StreamDetails | Nullish): Promise<M3u8> {
		streamDetails ??= await this.fetchStreamDetails();

		const response = await got<M3u8>(streamDetails.publicLivestreamUrl);

		return response.body;
	}

	private pickBestQuality(m3u8: M3u8): URL {
		const parser = new M3u8Parser();

		parser.push(m3u8);
		parser.end();

		if (!parser.manifest.playlists) {
			throw new TypeError('No playlists found');
		}

		parser.manifest.playlists.sort(Sort.descending(x => x.attributes.RESOLUTION.width * x.attributes.RESOLUTION.height));

		const [best] = parser.manifest.playlists;

		return new URL(best.uri);
	}

	private filename(url: URL): string {
		return path.basename(url.pathname);
	}
}
