<template>
  <v-dialog :value="dialog" max-width="400" @input="updateDialog">
    <v-card>
      <v-card-title>Settings</v-card-title>
      <v-card-text>
        <v-select
          :items="voices"
          label="Select Voice"
          :value="localSelectedVoice"
          @input="updateSelectedVoice"
        ></v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'SettingsDialog',
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    voices: {
      type: Array,
      required: true
    },
    selectedVoice: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      localSelectedVoice: this.selectedVoice
    }
  },
  watch: {
    selectedVoice(newVal) {
      this.localSelectedVoice = newVal;
    }
  },
  methods: {
    updateDialog(value) {
      this.$emit('update:dialog', value);
    },
    closeDialog() {
      this.$emit('update:dialog', false);
    },
    updateSelectedVoice(value) {
      this.localSelectedVoice = value;
      this.$emit('update:selectedVoice', value);
    }
  }
}
</script>