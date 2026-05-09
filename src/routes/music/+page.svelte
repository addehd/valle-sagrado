<script lang="ts">
	import { onDestroy } from 'svelte';

	let audioCtx: AudioContext | null = null;
	let currentSong: string | null = null;
	let playTimeout: ReturnType<typeof setTimeout> | null = null;

	const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23;
	const G4 = 392.00, A4 = 440.00, B4 = 493.88;
	const C5 = 523.25, D5 = 587.33;
	const q = 0.32, h = 0.64, e = 0.16;

	type Note = [number, number];

	const songs: { id: string; name: string; emoji: string; bg: string; ring: string; notes: Note[] }[] = [
		{
			id: 'twinkle',
			name: 'Twinkle Twinkle',
			emoji: '⭐',
			bg: '#FBBF24',
			ring: '#D97706',
			notes: [
				[C4, q], [C4, q], [G4, q], [G4, q], [A4, q], [A4, q], [G4, h],
				[F4, q], [F4, q], [E4, q], [E4, q], [D4, q], [D4, q], [C4, h],
				[G4, q], [G4, q], [F4, q], [F4, q], [E4, q], [E4, q], [D4, h],
				[G4, q], [G4, q], [F4, q], [F4, q], [E4, q], [E4, q], [D4, h],
				[C4, q], [C4, q], [G4, q], [G4, q], [A4, q], [A4, q], [G4, h],
				[F4, q], [F4, q], [E4, q], [E4, q], [D4, q], [D4, q], [C4, h],
			]
		},
		{
			id: 'mary',
			name: 'Mary Had a Little Lamb',
			emoji: '🐑',
			bg: '#F472B6',
			ring: '#DB2777',
			notes: [
				[E4, q], [D4, q], [C4, q], [D4, q], [E4, q], [E4, q], [E4, h],
				[D4, q], [D4, q], [D4, h], [E4, q], [G4, q], [G4, h],
				[E4, q], [D4, q], [C4, q], [D4, q], [E4, q], [E4, q], [E4, q], [E4, q],
				[D4, q], [D4, q], [E4, q], [D4, q], [C4, h],
			]
		},
		{
			id: 'hotcross',
			name: 'Hot Cross Buns',
			emoji: '🥐',
			bg: '#FB923C',
			ring: '#C2410C',
			notes: [
				[E4, q], [D4, q], [C4, h],
				[E4, q], [D4, q], [C4, h],
				[C4, e], [C4, e], [C4, e], [C4, e], [D4, e], [D4, e], [D4, e], [D4, e],
				[E4, q], [D4, q], [C4, h],
			]
		},
		{
			id: 'rowrow',
			name: 'Row Row Your Boat',
			emoji: '🚣',
			bg: '#60A5FA',
			ring: '#1D4ED8',
			notes: [
				[C4, q], [C4, q], [C4, q], [D4, e], [E4, h],
				[E4, q], [D4, e], [E4, q], [F4, e], [G4, h],
				[C5, e], [C5, e], [C5, e], [G4, e], [G4, e], [G4, e], [E4, e], [E4, e], [E4, e], [C4, e], [C4, e], [C4, e],
				[G4, q], [F4, e], [E4, q], [D4, e], [C4, h],
			]
		},
		{
			id: 'babyshark',
			name: 'Baby Shark',
			emoji: '🦈',
			bg: '#34D399',
			ring: '#047857',
			notes: [
				[D5, e], [C5, e], [G4, q], [G4, e], [G4, e], [G4, e], [G4, e], [G4, e], [G4, e], [0, q],
				[D5, e], [C5, e], [G4, q], [G4, e], [G4, e], [G4, e], [G4, e], [G4, e], [G4, e], [0, q],
				[D5, e], [C5, e], [G4, q], [G4, e], [G4, e], [G4, e], [G4, e], [G4, e], [G4, e], [0, q],
				[D5, h + 0.2],
			]
		},
		{
			id: 'oldmacdonald',
			name: 'Old MacDonald',
			emoji: '🐄',
			bg: '#86EFAC',
			ring: '#15803D',
			notes: [
				[G4, q], [G4, q], [G4, q], [D4, q], [E4, q], [E4, q], [D4, h],
				[B4, q], [B4, q], [A4, q], [A4, q], [G4, h],
				[D4, q], [G4, q], [G4, q], [G4, q], [E4, q], [E4, q], [D4, h],
				[B4, q], [B4, q], [A4, q], [A4, q], [G4, h],
			]
		},
	];

	function playNotes(notes: Note[]): number {
		const AudioCtxCtor: typeof AudioContext =
			window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!;
		const ctx = new AudioCtxCtor();
		audioCtx = ctx;

		let time = ctx.currentTime + 0.05;
		let totalDuration = 0.05;

		for (const [freq, dur] of notes) {
			if (freq > 0) {
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.type = 'triangle';
				osc.frequency.setValueAtTime(freq, time);
				gain.gain.setValueAtTime(0, time);
				gain.gain.linearRampToValueAtTime(0.35, time + 0.02);
				gain.gain.linearRampToValueAtTime(0.001, time + dur * 0.85);
				osc.start(time);
				osc.stop(time + dur);
			}
			time += dur;
			totalDuration += dur;
		}

		return totalDuration;
	}

	function playSong(song: typeof songs[0]) {
		stopSong();
		currentSong = song.id;
		const duration = playNotes(song.notes);
		playTimeout = setTimeout(() => {
			currentSong = null;
		}, duration * 1000 + 300);
	}

	function stopSong() {
		if (playTimeout !== null) {
			clearTimeout(playTimeout);
			playTimeout = null;
		}
		if (audioCtx) {
			audioCtx.close();
			audioCtx = null;
		}
		currentSong = null;
	}

	onDestroy(stopSong);
</script>

<div
	class="min-h-screen flex flex-col items-center py-10 px-4"
	style="background: linear-gradient(135deg, #fce4ec 0%, #fff9c4 50%, #e3f2fd 100%);">
	<div class="text-6xl md:text-8xl select-none mb-2">🎵</div>

	<h1 class="text-4xl md:text-6xl font-black text-center text-gray-800 mb-2">
		Music Time!
	</h1>
	<p class="text-base md:text-lg text-gray-500 font-medium text-center mb-10">
		Press a button to play a song!
	</p>

	<div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-2xl">
		{#each songs as song}
			<button
				onclick={() => currentSong === song.id ? stopSong() : playSong(song)}
				class="rounded-3xl p-5 md:p-6 flex flex-col items-center gap-2 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer select-none"
				style="background-color: {song.bg}; {currentSong === song.id
					? `outline: 4px solid white; box-shadow: 0 0 0 8px ${song.ring}, 0 12px 30px rgba(0,0,0,0.25)`
					: 'box-shadow: 0 6px 20px rgba(0,0,0,0.15)'}">
				<span class="text-5xl md:text-6xl leading-none">{song.emoji}</span>
				<span
					class="text-xs md:text-sm font-black text-white text-center leading-tight"
					style="text-shadow: 1px 1px 3px rgba(0,0,0,0.3)">
					{song.name}
				</span>
				{#if currentSong === song.id}
					<span class="text-xs text-white font-bold animate-pulse">♪ Playing</span>
				{/if}
			</button>
		{/each}
	</div>

	<div class="mt-10 h-16 flex items-center justify-center">
		{#if currentSong}
			<button
				onclick={stopSong}
				class="bg-red-500 hover:bg-red-400 active:bg-red-600 text-white font-black text-lg px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95">
				⏹ Stop Music
			</button>
		{/if}
	</div>

	<a href="/" class="text-gray-400 hover:text-gray-600 text-sm transition-colors mt-2">
		← Back to home
	</a>
</div>
