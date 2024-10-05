<template>
  <div class="message-container">
    <v-btn icon class="play-button" @click="toggleSpeech">
      <transition name="icon-fade" mode="out-in">
        <v-icon :key="isPlaying ? 'mdi-pause' : 'mdi-play'" >
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
            :class="['sentence', { highlighted: highlightedIndex === idx }]"
            @mouseenter="highlightSentence(idx)"
            @mouseleave="unhighlightSentence"
            @click="speakSentence(part.text)"
          >{{ part.text }}</span>
          <span v-else-if="part.type === 'space'"> </span>
          <br v-else />
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
      currentUtterance: null
    }
  },
  computed: {
    cardColor() {
      return this.index % 2 === 0 ? 'green lighten-5' : 'yellow lighten-5';
    },
    parts() {
      const lines = this.message.text.split('\n');
      let result = [];
      lines.forEach((line, lineIdx) => {
        const sentences = line.match(/[^.!?]+[.!?]*/g) || [];
        sentences.forEach((sentence, sentenceIdx) => {
          const trimmed = sentence.trim();
          if (trimmed) {
            result.push({ type: 'sentence', text: trimmed });
            if (sentenceIdx < sentences.length - 1) {
              result.push({ type: 'space' });
            }
          }
        });
        if (lineIdx < lines.length - 1) {
          result.push({ type: 'newline' });
        }
      });
      return result;
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
      this.currentUtterance = new SpeechSynthesisUtterance(this.message.text);
      this.currentUtterance.onstart = () => {
        this.isPlaying = true;
      };
      this.currentUtterance.onend = () => {
        this.isPlaying = false;
      };
      this.currentUtterance.onerror = () => {
        this.isPlaying = false;
      };
      speechSynthesis.speak(this.currentUtterance);
    },
    speakSentence(sentence) {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      this.currentUtterance = new SpeechSynthesisUtterance(sentence);
      this.currentUtterance.onstart = () => {
        this.isPlaying = true;
      };
      this.currentUtterance.onend = () => {
        this.isPlaying = false;
      };
      this.currentUtterance.onerror = () => {
        this.isPlaying = false;
      };
      speechSynthesis.speak(this.currentUtterance);
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