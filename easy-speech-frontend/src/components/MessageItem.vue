<template>
  <div class="message-container">
    <v-btn icon class="play-button" @click="toggleSpeech">
      <transition name="icon-fade" mode="out-in">
        <v-icon :key="isPlaying ? 'mdi-pause' : 'mdi-play'">
          {{ isPlaying ? 'mdi-pause' : 'mdi-play' }}
        </v-icon>
      </transition>
    </v-btn>
    <v-card
      :color="cardColor"
      class="ma-2 message-card"
    >
      <v-card-text class="message-text">
        <template v-for="(part, idx) in parts" :key="idx">
          <span
            v-if="part.type === 'sentence'"
            :class="[
              'sentence', 
              { 
                'hover-highlight': hoverHighlightIndex === part.index, 
                'playing-highlight': playingHighlightIndex === part.index 
              }
            ]"
            @mouseenter="highlightSentence(part.index)"
            @mouseleave="unhighlightSentence"
            @click="speakFromSentence(part.index)"
          >{{ part.text }}</span>
          <span v-else-if="part.type === 'space'"> </span>
          <br v-else-if="part.type === 'newline'"/>
        </template>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import SpeechSynthesisService from '../services/SpeechSynthesisService.js';
import GuidUtils from '../utils/GuidUtils.js';

export default {
  name: 'MessageItem',
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
      hoverHighlightIndex: null,
      playingHighlightIndex: null,
      isPlaying: false,
      activeGuid: null
    }
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
    sentences() {
      return this.splitResult.sentences;
    }
  },
  methods: {
    toggleSpeech() {
      if (this.isPlaying) {
        SpeechSynthesisService.cancelSpeech();
        this.isPlaying = false;
      } else {
        this.speakMessage();
      }
    },
    speakMessage() {
      if (speechSynthesis.speaking) {
        SpeechSynthesisService.cancelSpeech();
      }
      this.isPlaying = true;
      this.playingHighlightIndex = null;
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
          this.playingHighlightIndex = null;
        }
      };
      const onError = () => {
        if (this.activeGuid === guid) {
          this.isPlaying = false;
          this.playingHighlightIndex = null;
        }
      };
      SpeechSynthesisService.speakText(this.message.text, onBoundary, onEnd, onError);
    },
    speakFromSentence(startIdx) {
      if (speechSynthesis.speaking) {
        SpeechSynthesisService.cancelSpeech();
      }
      this.isPlaying = true;
      const guid = GuidUtils.generateGuid();
      this.activeGuid = guid;
      const playNext = (idx) => {
        if (idx >= this.sentences.length) {
          if (this.activeGuid === guid) {
            this.isPlaying = false;
            this.playingHighlightIndex = null;
          }
          return;
        }
        this.playingHighlightIndex = idx;
        const onEnd = () => {
          if (this.activeGuid === guid) {
            playNext(idx + 1);
          }
        };
        const onError = () => {
          if (this.activeGuid === guid) {
            this.isPlaying = false;
            this.playingHighlightIndex = null;
          }
        };
        SpeechSynthesisService.speakText(this.sentences[idx], null, onEnd, onError);
      };
      playNext(startIdx);
    },
    updatePlayingHighlight(charIndex) {
      for (let part of this.parts) {
        if (part.type === 'sentence' && charIndex >= part.start && charIndex < part.end) {
          this.playingHighlightIndex = part.index;
          return;
        }
      }
      this.playingHighlightIndex = null;
    },
    highlightSentence(idx) {
      this.hoverHighlightIndex = idx;
    },
    unhighlightSentence() {
      this.hoverHighlightIndex = null;
    }
  },
  beforeUnmount() {
    if (speechSynthesis.speaking) {
      SpeechSynthesisService.cancelSpeech();
    }
  }
}
</script>

<style scoped>
.message-container {
  width: 100%;
  display: flex;
  align-items: center;
}
.play-button {
  margin-right: 8px;
}
.message-card {
  width: 100%;
  color: black;
}
.message-text {
  white-space: pre-wrap;
}
.sentence {
  cursor: pointer;
  transition: background-color 0.3s;
  color: black;
}
.sentence:hover {
  background-color: #FFFFFF;
}
.hover-highlight {
  background-color: #FFFFFF;
}
.playing-highlight {
  background-color: #FFFFFF;
}
.icon-fade-enter-active, .icon-fade-leave-active {
  transition: opacity 0.3s;
}
.icon-fade-enter-from, .icon-fade-leave-to {
  opacity: 0;
}
</style>