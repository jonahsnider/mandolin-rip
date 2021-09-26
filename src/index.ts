import {URL} from 'node:url';
import consola, {Consola} from 'consola';
import delay from 'delay';
import pRetry from 'p-retry';
import config from './config.json';
import {Mandolin} from './mandolin';

const DELAY = 3 * 1000;
const THREAD_RETRIES = 10;

let threadIdCounter = 0;

async function main() {
	const {token} = config;

	if (!token.startsWith('Bearer')) {
		consola.warn("token didn't start with Bearer, make sure it's definitely valid");
	}

	const uuids = config.streamUrls.map(streamUrl => new URL(streamUrl).pathname.slice('/watch/'.length));
	const threads: Array<Promise<void>> = [];

	for (const uuid of uuids) {
		const makeThread = async () => {
			const logger = consola.withTag(uuid).withTag(`thread-${threadIdCounter}`);
			logger.info('starting thread');

			threadIdCounter++;

			try {
				await thread({uuid, token, logger});
			} catch (error) {
				logger.error(error);
			}
		};

		threads.push(pRetry(makeThread, {retries: THREAD_RETRIES}));
	}
}

main().catch(error => {
	console.error(error);

	process.exit(1);
});

async function thread({uuid, token, logger}: {uuid: string; token: string; logger: Consola}) {
	const mandolin = new Mandolin(uuid, token);

	const streamDetails = await mandolin.fetchStreamDetails();

	if (!streamDetails.isActive) {
		logger.warn('stream is not active');
	}

	while (true) {
		// eslint-disable-next-line no-await-in-loop
		const downloadedFiles = await mandolin.download();

		logger.withTag('downloads').info(downloadedFiles.join(', ') || '(none)');

		// eslint-disable-next-line no-await-in-loop
		await delay(DELAY);
	}
}
