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
import egg21 from './egg_21.svg';
import egg42 from './egg_42.svg';
import egg56 from './egg_56.png';
import egg64 from './egg_64.svg';
import egg67 from './egg_67.svg';
import egg69 from './egg_69.png';
import egg72 from './egg_72.png';
import egg420 from './egg_420.svg';
import egg451 from './egg_451.svg';
import egg666 from './egg_666.svg';
import egg911 from './egg_911.svg';
import egg1337 from './egg_1337.svg';
import egg1984 from './egg_1984.svg';
import egg8008 from './egg_8008.svg';

const images = [cat, dog, frog, panda, bear, rabbit, koala, lion, owl, chicken, robot, mouse];
const easterEggs: Record<number, string> = {
	18: celebration,
	21: egg21,
	42: egg42,
	56: egg56,
	64: egg64,
	67: egg67,
	69: egg69,
	72: egg72,
	420: egg420,
	451: egg451,
	666: egg666,
	911: egg911,
	1337: egg1337,
	1984: egg1984,
	8008: egg8008
};
for (let i = 100; i < 10_0000; i += 100) easterEggs[i] = celebration;

export function getAnimal(n: number) {
	if (easterEggs[n]) return easterEggs[n];
	return images[n % images.length];
}
