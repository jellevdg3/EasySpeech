<template>
  <div class="message-container">
    <MessageItemSpeech
      ref="speech"
      :message="message"
      :index="index"
      @toggle-speech="handleToggleSpeech"
      @highlight="handleHighlight"
      @unhighlight="handleUnhighlight"
    />
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
import MessageItemSpeech from './MessageItemSpeech.vue';

export default {
  name: 'MessageItem',
  components: {
    MessageItemSpeech
  },
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
      playingHighlightIndex: null
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
    handleToggleSpeech(isPlaying) {
      this.isPlaying = isPlaying;
    },
    handleHighlight(idx) {
      this.playingHighlightIndex = idx;
    },
    handleUnhighlight() {
      this.playingHighlightIndex = null;
    },
    highlightSentence(idx) {
      this.hoverHighlightIndex = idx;
    },
    unhighlightSentence() {
      this.hoverHighlightIndex = null;
    },
    speakFromSentence(startIdx) {
      this.$refs.speech.speakFromSentence(startIdx);
    }
  },
  beforeUnmount() {
    if (this.$refs.speech) {
      this.$refs.speech.cancelSpeech();
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
</style>