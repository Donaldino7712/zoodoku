import type { ConfettiOptions } from '@tsparticles/confetti';

export async function launchConfetti(options: ConfettiOptions): Promise<void> {
	const { confetti } = await import('@tsparticles/confetti');
	await confetti(options);
}
