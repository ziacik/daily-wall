#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs';
import OpenAI from 'openai';
import path from 'path';
import { setWallpaper } from 'wallpaper';

const openai = new OpenAI();

async function retryAsync<T>(
	fn: () => Promise<T>,
	retries = 3,
	delay = 60000
): Promise<T> {
	let lastError: unknown;
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;
			console.warn(`Attempt ${attempt} failed.`);
			await wait(delay);
		}
	}
	throw new Error(`Failed after ${retries} attempts. Reason: ${lastError}`);
}

async function wait(delay: number) {
	return new Promise((resolve) => setTimeout(resolve, delay));
}

async function main() {
	const image = await retryAsync<OpenAI.Images.ImagesResponse>(() =>
		openai.images.generate({
			model: 'dall-e-3',
			size: '1792x1024',
			prompt:
				"Generate a colorful wallpaper featuring a photorealistic character designed with a style inspired by anime. The character is a young girl with large, expressive eyes and long hair styled in soft waves. She is dressed in a cute dress and her pose is random. The girl's layer is small and features her entire body, placed on a clean, spacious background, maybe on the side of it. The background should have a nice color.",
		})
	);

	if (image.data[0].url) {
		const imageUrl = image.data[0].url;

		const currentDate = new Date().toISOString().split('T')[0];
		const imagePath = path.resolve(`./daily-wall-${currentDate}.jpg`);
		const writer = fs.createWriteStream(imagePath);

		const response = await retryAsync(() =>
			axios({
				url: imageUrl,
				method: 'GET',
				responseType: 'stream',
			})
		);

		response.data.pipe(writer);

		await new Promise((resolve, reject) => {
			writer.on('finish', resolve);
			writer.on('error', reject);
		});

		await setWallpaper(imagePath);
	}
}

main();
