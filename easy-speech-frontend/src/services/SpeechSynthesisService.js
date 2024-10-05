class SpeechSynthesisService {
  speakText(text, onBoundary, onEnd, onError) {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    if (onBoundary) {
      utterance.onboundary = onBoundary;
    }
    utterance.onend = onEnd;
    utterance.onerror = onError;
    speechSynthesis.speak(utterance);
  }

  cancelSpeech() {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  }

  splitIntoParts(text) {
    const lines = text.split('\n');
    let partsResult = [];
    let charIndex = 0;
    let sentenceIdx = 0;
    const sentences = [];

    lines.forEach((line, lineIdx) => {
      const sentencesInLine = line.match(/[^.!?]+[.!?]*\s*/g) || [];
      sentencesInLine.forEach((sentence) => {
        if (sentence) {
          const hasTrailingSpace = sentence.endsWith(' ');
          const trimmedSentence = hasTrailingSpace ? sentence.trimEnd() : sentence;
          partsResult.push({ type: 'sentence', text: trimmedSentence, index: sentenceIdx, start: charIndex, end: charIndex + trimmedSentence.length });
          sentences.push(trimmedSentence);
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

    return { parts: partsResult, sentences };
  }
}

export default new SpeechSynthesisService();