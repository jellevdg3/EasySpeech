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
      activeGuid: null
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
        this.speakMessage();
      }
    },
    speakMessage() {
      if (speechSynthesis.speaking) {
        SpeechSynthesisService.cancelSpeech();
      }
      this.isPlaying = true;
      this.$emit('toggle-speech', this.isPlaying);
      this.$emit('highlight', null);
      const guid = GuidUtils.generateGuid();
      this.activeGuid = guid;
      const onBoundary = (event) => {
        if (event.name === 'word' || event.name === 'sentence') {
          this.updatePlayingHighlight(event.charIndex);
        }
      };
      const onEnd = () => {
        if (this.activeGuid === guid) {
          this.isPlaying = false;
          this.$emit('toggle-speech', this.isPlaying);
          this.$emit('highlight', null);
        }
      };
      const onError = () => {
        if (this.activeGuid === guid) {
          this.isPlaying = false;
          this.$emit('toggle-speech', this.isPlaying);
          this.$emit('highlight', null);
        }
      };
      SpeechSynthesisService.speakText(this.message.text, onBoundary, onEnd, onError);
    },
    speakFromSentence(startIdx) {
      if (speechSynthesis.speaking) {
        SpeechSynthesisService.cancelSpeech();
      }
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
          }
          return;
        }
        this.$emit('highlight', idx);
        const onEnd = () => {
          if (this.activeGuid === guid) {
            playNext(idx + 1);
          }
        };
        const onError = () => {
          if (this.activeGuid === guid) {
            this.isPlaying = false;
            this.$emit('toggle-speech', this.isPlaying);
            this.$emit('highlight', null);
          }
        };
        SpeechSynthesisService.speakText(this.sentences[idx], null, onEnd, onError);
      };
      playNext(startIdx);
    },
    updatePlayingHighlight(charIndex) {
      for (let part of this.splitResult.parts) {
        if (part.type === 'sentence' && charIndex >= part.start && charIndex < part.end) {
          this.$emit('highlight', part.index);
          return;
        }
      }
      this.$emit('highlight', null);
    },
    cancelSpeech() {
      SpeechSynthesisService.cancelSpeech();
      this.isPlaying = false;
      this.$emit('toggle-speech', this.isPlaying);
      this.$emit('highlight', null);
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
.icon-fade-enter-active, .icon-fade-leave-active {
  transition: opacity 0.3s;
}
.icon-fade-enter-from, .icon-fade-leave-to {
  opacity: 0;
}
</style>