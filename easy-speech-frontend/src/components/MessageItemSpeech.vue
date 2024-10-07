<template>
	<v-btn icon class="play-button" @click="toggleSpeech">
		<transition name="icon-fade" mode="out-in">
			<v-icon :key="isPlaying ? 'mdi-pause' : 'mdi-play'">
				{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}
			</v-icon>
		</transition>
	</v-btn>
</template>

<script>
import SpeechSynthesisService from '../services/SpeechSynthesisService.js';
import GuidUtils from '../utils/GuidUtils.js';

export default {
	name: 'MessageItemSpeech',
	props: {
		message: {
			type: Object,
			required: true
		},
		index: {
			type: Number,
			required: true
		}
	},
	data() {
		return {
			isPlaying: false,
			activeGuid: null,
			preloadedSentences: {},
			maxQueueSize: 1
		}
	},
	computed: {
		splitResult() {
			return SpeechSynthesisService.splitIntoParts(this.message.text);
		},
		sentences() {
			return this.splitResult.sentences;
		}
	},
	methods: {
		toggleSpeech() {
			if (this.isPlaying) {
				this.cancelSpeech();
			} else {
				this.speakFromSentence(0);
			}
		},
		speakFromSentence(startIdx) {
			if (speechSynthesis.speaking) {
				SpeechSynthesisService.cancelSpeech();
			}

			this.maxQueueSize = 1;
			this.isPlaying = true;
			this.$emit('toggle-speech', this.isPlaying);
			const guid = GuidUtils.generateGuid();
			this.activeGuid = guid;

			const playNext = (idx) => {
				if (idx >= this.sentences.length) {
					if (this.activeGuid === guid) {
						this.isPlaying = false;
						this.$emit('toggle-speech', this.isPlaying);
						this.$emit('highlight', null);
						this.preloadedSentences = {};
					}
					return;
				}
				this.$emit('highlight', idx);

				const onEnd = () => {
					if (this.activeGuid === guid) {
						this.maxQueueSize++;
						if (this.maxQueueSize > 10) {
							this.maxQueueSize = 10;
						}
						this.preloadSentences(idx + 2);
						playNext(idx + 1);
					}
				};
				const onError = () => {
					if (this.activeGuid === guid) {
						this.isPlaying = false;
						this.$emit('toggle-speech', this.isPlaying);
						this.$emit('highlight', null);
						this.preloadedSentences = {};
					}
				};
				SpeechSynthesisService.speakText(this.sentences[idx], null, onEnd, onError);
				this.preloadSentences(startIdx + 1);

				if (Object.keys(this.preloadedSentences).length > this.maxQueueSize) {
					const keys = Object.keys(this.preloadedSentences).map(Number);
					const minIdx = Math.min(...keys);
					delete this.preloadedSentences[minIdx];
				}
			};
			playNext(startIdx);
		},
		preloadSentences(startIdx) {
			const endIdx = Math.min(startIdx + this.maxQueueSize, this.sentences.length);
			for (let idx = startIdx; idx < endIdx; idx++) {
				if (!this.preloadedSentences[idx]) {
					SpeechSynthesisService.preloadText(this.sentences[idx]);
					this.preloadedSentences[idx] = true;
				}
			}
		},
		cancelSpeech() {
			SpeechSynthesisService.cancelSpeech();
			SpeechSynthesisService.clearCache();
			this.isPlaying = false;
			this.$emit('toggle-speech', this.isPlaying);
			this.$emit('highlight', null);
			this.preloadedSentences = {};
		}
	},
	beforeUnmount() {
		this.cancelSpeech();
	}
}
</script>

<style scoped>
.play-button {
	margin-right: 8px;
}

.icon-fade-enter-active,
.icon-fade-leave-active {
	transition: opacity 0.3s;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
	opacity: 0;
}
</style>