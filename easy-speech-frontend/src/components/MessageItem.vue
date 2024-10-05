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
            :class="['sentence', { highlighted: highlightedIndex === part.index }]"
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
      highlightedIndex: null,
      isPlaying: false,
      currentUtterance: null,
      sentences: []
    }
  },
  computed: {
    cardColor() {
      return this.index % 2 === 0 ? 'green lighten-5' : 'yellow lighten-5';
    },
    parts() {
      const lines = this.message.text.split('\n');
      let partsResult = [];
      let charIndex = 0;
      let sentenceIdx = 0;
      lines.forEach((line, lineIdx) => {
        const sentences = line.match(/[^.!?]+[.!?]*\s*/g) || [];
        sentences.forEach((sentence) => {
          if (sentence) {
            const hasTrailingSpace = sentence.endsWith(' ');
            const trimmedSentence = hasTrailingSpace ? sentence.trimEnd() : sentence;
            partsResult.push({ type: 'sentence', text: trimmedSentence, index: sentenceIdx, start: charIndex, end: charIndex + trimmedSentence.length });
            this.sentences.push(trimmedSentence);
            charIndex += sentence.length;
            sentenceIdx++;
            if (hasTrailingSpace) {
              partsResult.push({ type: 'space' });
              charIndex += 1;
            }
          }
        });
        if (lineIdx < lines.length - 1) {
          partsResult.push({ type: 'newline' });
          charIndex += 1;
        }
      });
      return partsResult;
    }
  },
  methods: {
    toggleSpeech() {
      if (this.isPlaying) {
        speechSynthesis.cancel();
      } else {
        this.speakMessage();
      }
    },
    speakMessage() {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      this.isPlaying = true;
      this.highlightedIndex = null;
      this.currentUtterance = new SpeechSynthesisUtterance(this.message.text);
      this.currentUtterance.onstart = () => {
        this.isPlaying = true;
      };
      this.currentUtterance.onboundary = (event) => {
        if (event.name === 'word' || event.name === 'sentence') {
          this.updateHighlightedSentence(event.charIndex);
        }
      };
      this.currentUtterance.onend = () => {
        this.isPlaying = false;
        this.highlightedIndex = null;
      };
      this.currentUtterance.onerror = () => {
        this.isPlaying = false;
        this.highlightedIndex = null;
      };
      speechSynthesis.speak(this.currentUtterance);
    },
    speakFromSentence(startIdx) {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      this.isPlaying = true;
      const playNext = (idx) => {
        if (idx >= this.sentences.length) {
          this.isPlaying = false;
          this.highlightedIndex = null;
          return;
        }
        this.highlightedIndex = idx;
        const utterance = new SpeechSynthesisUtterance(this.sentences[idx]);
        utterance.onend = () => {
          playNext(idx + 1);
        };
        utterance.onerror = () => {
          this.isPlaying = false;
          this.highlightedIndex = null;
        };
        speechSynthesis.speak(utterance);
      };
      playNext(startIdx);
    },
    updateHighlightedSentence(charIndex) {
      for (let part of this.parts) {
        if (part.type === 'sentence' && charIndex >= part.start && charIndex < part.end) {
          this.highlightedIndex = part.index;
          return;
        }
      }
      this.highlightedIndex = null;
    },
    highlightSentence(idx) {
      this.highlightedIndex = idx;
    },
    unhighlightSentence() {
      this.highlightedIndex = null;
    }
  },
  beforeUnmount() {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
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
}
.message-text {
  white-space: pre-wrap;
}
.sentence {
  cursor: pointer;
  transition: background-color 0.3s;
}
.sentence:hover {
  background-color: #d3d3d3;
}
.highlighted {
  background-color: #b3b3b3;
}
.icon-fade-enter-active, .icon-fade-leave-active {
  transition: opacity 0.3s;
}
.icon-fade-enter-from, .icon-fade-leave-to {
  opacity: 0;
}
</style>