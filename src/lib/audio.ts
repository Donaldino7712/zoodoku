import { audio } from './config.svelte';

type SoundName = 'scribble' | 'found' | 'lose' | 'win';

let audioContext: AudioContext | undefined;

function getAudioContext(): AudioContext | undefined {
	if (typeof window === 'undefined') return;
	if (!audioContext) {
		const AudioContextConstructor =
			window.AudioContext ||
			(window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (!AudioContextConstructor) return;
		audioContext = new AudioContextConstructor();
	}
	if (audioContext.state === 'suspended') void audioContext.resume();
	return audioContext;
}

function tone(
	context: AudioContext,
	frequency: number,
	start: number,
	duration: number,
	volume: number,
	type: OscillatorType = 'sine'
): void {
	const oscillator = context.createOscillator();
	const filter = context.createBiquadFilter();
	const gain = context.createGain();
	oscillator.type = type;
	oscillator.frequency.setValueAtTime(frequency, start);
	filter.type = 'lowpass';
	filter.frequency.setValueAtTime(2000, start);
	filter.Q.value = 0.35;
	oscillator.connect(filter);
	filter.connect(gain);
	gain.connect(context.destination);
	gain.gain.setValueAtTime(0.0001, start);
	gain.gain.exponentialRampToValueAtTime(volume, start + 0.04);
	gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
	oscillator.start(start);
	oscillator.stop(start + duration);
}

function scribble(context: AudioContext, start: number): void {
	const buffer = context.createBuffer(1, context.sampleRate * 0.07, context.sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
	const noise = context.createBufferSource();
	const filter = context.createBiquadFilter();
	const gain = context.createGain();
	noise.buffer = buffer;
	filter.type = 'bandpass';
	filter.frequency.value = 1800;
	filter.Q.value = 0.7;
	noise.connect(filter);
	filter.connect(gain);
	gain.connect(context.destination);
	gain.gain.setValueAtTime(0.0001, start);
	gain.gain.exponentialRampToValueAtTime(0.14, start + 0.015);
	gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.07);
	noise.start(start);
	noise.stop(start + 0.07);
}

export function playSound(sound: SoundName): void {
	if (!audio.current) return;
	const context = getAudioContext();
	if (!context) return;
	const start = context.currentTime;
	switch (sound) {
		case 'scribble':
			scribble(context, start);
			break;
		case 'found':
			tone(context, 440, start, 0.16, 0.12);
			tone(context, 660, start + 0.09, 0.22, 0.14);
			break;
		case 'lose':
			tone(context, 280, start, 0.16, 0.14);
			tone(context, 190, start + 0.1, 0.22, 0.12);
			break;
		case 'win':
			tone(context, 440, start, 0.18, 0.12);
			tone(context, 554, start + 0.11, 0.18, 0.12);
			tone(context, 659, start + 0.22, 0.3, 0.15);
			break;
	}
}
