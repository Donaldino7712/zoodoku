import cat from './cat.svg';
import dog from './dog.svg';
import frog from './frog.svg';
import celebration from './celebration.svg';
import panda from './panda.svg';
import bear from './bear.svg';
import rabbit from './rabbit.svg';
import koala from './koala.svg';
import lion from './lion.svg';
import owl from './owl.svg';
import chicken from './chicken.svg';
import robot from './robot.svg';
import mouse from './mouse.svg';
const eggs = import.meta.glob<string>('./egg_*.{svg,png}', { eager: true, import: 'default' });
const daily = import.meta.glob<string>('./daily_*.{svg,png}', { eager: true, import: 'default' });

const images = [cat, dog, frog, panda, bear, rabbit, koala, lion, owl, chicken, robot, mouse];
const easterEggs: Record<number, string> = {
	18: celebration
};
for (const path in eggs) easterEggs[parseInt(path.match(/egg_(\d+)/)![1])] = eggs[path];
for (let i = 100; i < 10_0000; i += 100) easterEggs[i] = celebration;
const dailyImages: Record<string, string> = {};
for (const path in daily) {
	const match = path.match(/daily_(\d+)_(\d+)/);
	if (!match) continue;
	dailyImages[`${parseInt(match[1])}_${parseInt(match[2])}`] = daily[path];
}

export function getAnimal(n: number) {
	const day = new Date().getDate();
	const month = new Date().getMonth() + 1;
	if (dailyImages[`${day}_${month}`]) return dailyImages[`${day}_${month}`];

	if (easterEggs[n]) return easterEggs[n];
	return images[n % images.length];
}
