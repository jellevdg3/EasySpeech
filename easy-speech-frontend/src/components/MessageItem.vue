<template>
	<div class="message-container">
		<MessageItemSpeech ref="speech" :message="message" :index="index" @toggle-speech="handleToggleSpeech"
			@highlight="handleHighlight" @unhighlight="handleUnhighlight" />
		<v-card :color="cardColor" class="ma-2 message-card">
			<v-menu bottom right>
				<template #activator="{ props }">
					<v-btn icon tile :aria-haspopup="props['aria-haspopup']" :aria-expanded="props['aria-expanded']"
						@click="props.onClick" class="menu-button elevation-0" style="background-color: transparent;">
						<v-icon color="black">mdi-dots-vertical</v-icon>
					</v-btn>
				</template>
				<v-list>
					<v-list-item @click="openEditDialog">
						<v-list-item-title>{{ $t('edit') }}</v-list-item-title>
					</v-list-item>
					<v-list-item @click="deleteMessage">
						<v-list-item-title>{{ $t('delete') }}</v-list-item-title>
					</v-list-item>
				</v-list>
			</v-menu>
			<v-card-text class="message-text">
				<template v-for="(part, idx) in formattedParts" :key="idx">
					<component :is="getComponentType(part)" :id="`message-${index}-part-${idx}`"
						:class="getClasses(part)" @click="isInteractive(part) ? handleClick(part.index) : null"
						@dblclick="isInteractive(part) ? handleDblClick(part.index) : null"
						@mouseenter="isInteractive(part) ? highlightPart(part.index) : null"
						@mouseleave="isInteractive(part) ? unhighlightPart() : null"
						@pointerup="isInteractive(part) ? unhighlightPart() : null"
						@touchstart="isInteractive(part) ? highlightPart(part.index) : null"
						@touchend="isInteractive(part) ? unhighlightPart() : null"
						@touchcancel="isInteractive(part) ? unhighlightPart() : null">
						<template v-if="part.type === 'sentence' || part.type === 'heading'">
							<template v-for="(subPart, subIdx) in part.formattedText" :key="subIdx">
								<strong v-if="subPart.type === 'bold'">{{ subPart.text }}</strong>
								<em v-else-if="subPart.type === 'italic'">{{ subPart.text }}</em>
								<span v-else>{{ subPart.text }}</span>
							</template>
						</template>
						<template v-else-if="part.type === 'space'">
							<span class="space">&nbsp;</span>
						</template>
						<template v-else-if="part.type === 'newline'"><br /></template>
					</component>
				</template>
			</v-card-text>

			<v-dialog v-model="editDialog" max-width="600px">
				<v-card>
					<v-card-title>
						<span class="headline">{{ $t('editMessage') }}</span>
					</v-card-title>
					<v-card-text>
						<v-textarea v-model="editedText" :rules="[v => !!v || $t('typeMessage')]"
							label="{{ $t('editMessage') }}" auto-grow></v-textarea>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn color="blue darken-1" text @click="closeEditDialog">{{ $t('cancel') }}</v-btn>
						<v-btn color="blue darken-1" text @click="saveEdit" :disabled="!editedText">{{ $t('save')
							}}</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</v-card>
	</div>
</template>

<script>
import SpeechSynthesisService from '../services/SpeechSynthesisService.js';
import MessageItemSpeech from './MessageItemSpeech.vue';
import { useI18n } from 'vue-i18n';

export default {
	name: 'MessageItem',
	components: {
		MessageItemSpeech,
	},
	props: {
		message: {
			type: Object,
			required: true,
		},
		index: {
			type: Number,
			required: true,
		},
	},
	data() {
		return {
			hoverHighlightIndex: null,
			playingHighlightIndex: null,
			editDialog: false,
			editedText: '',
			isPlaying: false,
			clickTimeout: null,
			clickDelay: 300,
		};
	},
	computed: {
		cardColor() {
			return this.index % 2 === 0 ? '#d4ebf2' : '#add8e6';
		},
		splitResult() {
			return SpeechSynthesisService.splitIntoParts(this.message.text);
		},
		parts() {
			return this.splitResult.parts;
		},
		formattedParts() {
			return this.parts.map(part => {
				if (part.type === 'sentence') {
					const headingMatch = part.text.match(/^(#{1,6})\s+(.*)/);
					if (headingMatch) {
						const level = headingMatch[1].length;
						const content = headingMatch[2];
						return {
							...part,
							type: 'heading',
							level: level,
							formattedText: this.parseFormatting(content),
						};
					} else {
						return {
							...part,
							formattedText: this.parseFormatting(part.text),
						};
					}
				}
				return part;
			});
		},
		sentences() {
			return this.splitResult.sentences;
		},
	},
	setup() {
		const { t } = useI18n();
		return { t };
	},
	methods: {
		handleToggleSpeech(isPlaying) {
			this.isPlaying = isPlaying;
			if (isPlaying) {
				this.$emit('speech-started', this.index);
			} else {
				this.$emit('speech-stopped', this.index);
			}
		},
		handleHighlight(payload) {
			if (payload && typeof payload.partIndex !== 'undefined') {
				this.playingHighlightIndex = payload.partIndex;
			} else {
				this.playingHighlightIndex = null;
			}
			this.$emit('highlight', payload);
		},
		handleUnhighlight() {
			this.playingHighlightIndex = null;
		},
		highlightPart(idx) {
			this.hoverHighlightIndex = idx;
		},
		unhighlightPart() {
			this.hoverHighlightIndex = null;
		},
		speakFromPart(startIdx) {
			this.$refs.speech.speakFromSentence(startIdx);
		},
		playSingleSentence(index) {
			this.$refs.speech.speakSingleSentence(index);
		},
		handleClick(partIndex) {
			clearTimeout(this.clickTimeout);
			this.clickTimeout = setTimeout(() => {
				this.speakFromPart(partIndex);
			}, this.clickDelay);
		},
		handleDblClick(partIndex) {
			clearTimeout(this.clickTimeout);
			this.playSingleSentence(partIndex);
		},
		openEditDialog() {
			this.editedText = this.message.text;
			this.editDialog = true;
		},
		closeEditDialog() {
			this.editDialog = false;
			this.editedText = '';
		},
		saveEdit() {
			const updatedMessage = { ...this.message, text: this.editedText };
			this.$emit('edit', updatedMessage);
			this.closeEditDialog();
		},
		deleteMessage() {
			this.$emit('delete', this.message);
		},
		parseFormatting(text) {
			const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
			let lastIndex = 0;
			const parts = [];
			let match;

			while ((match = regex.exec(text)) !== null) {
				if (match.index > lastIndex) {
					parts.push({
						type: 'text',
						text: text.substring(lastIndex, match.index),
					});
				}
				const matchedText = match[0];
				if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
					parts.push({
						type: 'bold',
						text: matchedText.slice(2, -2),
					});
				} else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
					parts.push({
						type: 'italic',
						text: matchedText.slice(1, -1),
					});
				}
				lastIndex = regex.lastIndex;
			}

			if (lastIndex < text.length) {
				parts.push({
					type: 'text',
					text: text.substring(lastIndex),
				});
			}

			return parts;
		},
		getComponentType(part) {
			if (part.type === 'heading') {
				switch (part.level) {
					case 1:
						return 'h1';
					case 2:
						return 'h2';
					case 3:
						return 'h3';
					case 4:
						return 'h4';
					case 5:
						return 'h5';
					case 6:
						return 'h6';
					default:
						return 'span';
				}
			} else if (part.type === 'sentence') {
				return 'span';
			} else if (part.type === 'space') {
				return 'span';
			} else if (part.type === 'newline') {
				return 'br';
			} else {
				return 'span';
			}
		},
		getClasses(part) {
			if (part.type === 'sentence' || part.type === 'heading') {
				return [
					'sentence',
					{
						'hover-highlight': this.hoverHighlightIndex === part.index,
						'playing-highlight': this.playingHighlightIndex === part.index,
					},
				];
			}
			return '';
		},
		isInteractive(part) {
			return part.type === 'sentence' || part.type === 'heading';
		},
		stopSpeech() {
			if (this.$refs.speech) {
				this.$refs.speech.cancelSpeech();
			}
		},
	},
	beforeUnmount() {
		if (this.$refs.speech) {
			this.$refs.speech.cancelSpeech();
		}
	},
};
</script>

<style scoped>
.message-container {
	position: relative;
	width: 100%;
	max-width: 1024px;
	margin: 0 auto;
	display: flex;
	align-items: center;
}

.message-card {
	width: 100%;
	color: black;
	position: relative;
}

.menu-button {
	float: right;
	padding: 4px;
}

.message-text {
	white-space: pre-wrap;
	user-select: none;
}

.sentence,
h1,
h2,
h3,
h4,
h5,
h6 {
	cursor: pointer;
	transition: background-color 0.3s, box-shadow 0.3s;
	color: black;
	user-select: none;
}

@media (hover: hover) {

	.sentence:hover,
	h1:hover,
	h2:hover,
	h3:hover,
	h4:hover,
	h5:hover,
	h6:hover {}
}

.hover-highlight {}

.playing-highlight {
	background-color: #808080;
	color: #ffffff;
	box-shadow: 0 0 0 3px rgba(128, 128, 128, 1.0);
}

strong {
	font-weight: bold;
}

em {
	font-style: italic;
}

h1,
h2,
h3,
h4,
h5,
h6 {
	margin: 0;
	padding: 0;
}

.space {}
</style>