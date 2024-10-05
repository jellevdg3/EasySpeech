<template>
  <div class="message-container">
    <v-btn icon class="play-button" @click="speakMessage">
      <v-icon>mdi-play</v-icon>
    </v-btn>
    <v-card
      :color="cardColor"
      class="ma-2 message-card"
    >
      <v-card-text class="message-text">{{ message.text }}</v-card-text>
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
  computed: {
    cardColor() {
      return this.index % 2 === 0 ? 'green lighten-5' : 'yellow lighten-5';
    }
  },
  methods: {
    speakMessage() {
      const utterance = new SpeechSynthesisUtterance(this.message.text);
      speechSynthesis.speak(utterance);
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
</style>