import path from 'node:path';
import fs from 'node:fs/promises';
import execa from 'execa';
import {BASE_DOWNLOADS_DIR, BASE_STITCHED_DIR} from './constants';

const INPUT_FILENAME = 'ffmpeg_input.txt';
const OUTPUT_FILENAME = 'combined.mp4';

async function main() {
	const children = await fs.readdir(BASE_DOWNLOADS_DIR, {withFileTypes: true});
	const streams = children.filter(child => child.isDirectory() && !child.name.startsWith('.')).map(directory => path.join(BASE_DOWNLOADS_DIR, directory.name));

	for (const streamDirectory of streams) {
		/* eslint-disable no-await-in-loop */
		const uuid = path.basename(streamDirectory);
		const outputDir = path.join(BASE_STITCHED_DIR, uuid);

		await fs.mkdir(outputDir, {recursive: true});

		const inputPath = path.join(outputDir, INPUT_FILENAME);
		const outputPath = path.join(outputDir, OUTPUT_FILENAME);

		const files = (await fs.readdir(streamDirectory, {withFileTypes: true}))
			.filter(child => child.isFile() && child.name.endsWith('.ts'))
			.map(file => `file '${path.join(streamDirectory, file.name)}'`);

		await fs.writeFile(inputPath, files.join('\n'), 'utf-8');

		await execa(
			'ffmpeg',
			[
				// Overwrite
				'-y',
				// Force format
				'-f',
				'concat',
				// Not sure what this is for
				'-safe',
				'0',
				// Inputs from file
				'-i',
				inputPath,
				// Codec
				'-c',
				'copy',
				// Output
				outputPath,
			],
			{
				stdio: 'inherit',
				cwd: streamDirectory,
			},
		);
		/* eslint-enable no-await-in-loop */
	}
}

main().catch(error => {
	console.error(error);

	process.exit(1);
});
