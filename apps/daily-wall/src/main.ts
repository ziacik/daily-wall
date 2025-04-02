#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs';
import OpenAI from 'openai';
import path from 'path';
import { setWallpaper } from 'wallpaper';
// import terminalImage from "terminal-image";

const openai = new OpenAI();

async function main() {
	const image = await openai.images.generate({
		model: 'dall-e-3',
		size: '1792x1024',
		prompt:
			"Generate a colorful wallpaper featuring a photorealistic character designed with a style inspired by anime. The character is a young girl with large, expressive eyes and long hair styled in soft waves. She is dressed in a cute dress and her pose is random. The girl's layer is small and features her entire body, placed on a clean, spacious background. As a unique touch, incorporate something in the scene that subtly represents the current date.",
	});

	console.log(image);

	if (image.data[0].url) {
		// download the image to file
		const imageUrl = image.data[0].url;

		const currentDate = new Date().toISOString().split('T')[0];
		const imagePath = path.resolve(`./daily-wall-${currentDate}.jpg`);
		const writer = fs.createWriteStream(imagePath);

		const response = await axios({
			url: imageUrl,
			method: 'GET',
			responseType: 'stream',
		});

		response.data.pipe(writer);

		await new Promise((resolve, reject) => {
			writer.on('finish', resolve);
			writer.on('error', reject);
		});

		// console.log(await terminalImage.file(imagePath));

		await setWallpaper(imagePath);
	}

	console.log(image.data);
}

main();
