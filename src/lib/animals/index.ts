import cat from './cat.svg';
import dog from './dog.svg';
import frog from './frog.svg';
import panda from './panda.svg';
import bear from './bear.svg';
import rabbit from './rabbit.svg';
import koala from './koala.svg';
import lion from './lion.svg';
import owl from './owl.svg';

const images = [cat, dog, frog, panda, bear, rabbit, koala, lion, owl];

export function getAnimal(n: number) {
	return images[n % images.length];
}
