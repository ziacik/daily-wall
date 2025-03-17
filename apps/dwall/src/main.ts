import OpenAI from "openai";

const openai = new OpenAI();

async function main() {
  const image = await openai.images.generate({ model: "dall-e-3", size: "1792x1024", prompt: "Generate a colorful wallpaper featuring a photorealistic character designed with a style inspired by anime. The character is a young girl with large, expressive eyes and long hair styled in soft waves. She is dressed in a cute dress and her pose is random. The girl's layer is small and features her entire body, placed on a clean, spacious background. As a unique touch, incorporate something in the scene that subtly represents the current date." });

  console.log(image.data);
}

main();
