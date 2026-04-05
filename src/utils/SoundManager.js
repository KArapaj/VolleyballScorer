import Sound from 'react-native-sound';

// Enable playback in silence mode (iOS)
Sound.setCategory('Playback');

let whistleSound = null;
let celebrationSound = null;
let soundsEnabled = true;

export const initSounds = () => {
  // Load whistle sound
  whistleSound = new Sound('whistle.mp3', Sound.MAIN_BUNDLE, error => {
    if (error) {
      console.log('Failed to load whistle sound:', error);
      whistleSound = null;
    }
  });

  // Load celebration sound
  celebrationSound = new Sound('celebration.mp3', Sound.MAIN_BUNDLE, error => {
    if (error) {
      console.log('Failed to load celebration sound:', error);
      celebrationSound = null;
    }
  });
};

export const playWhistle = () => {
  if (!soundsEnabled || !whistleSound) return;

  whistleSound.stop(() => {
    whistleSound.play(success => {
      if (!success) {
        console.log('Whistle playback failed');
      }
    });
  });
};

export const playCelebration = () => {
  if (!soundsEnabled || !celebrationSound) return;

  celebrationSound.stop(() => {
    celebrationSound.play(success => {
      if (!success) {
        console.log('Celebration playback failed');
      }
    });
  });
};

export const setSoundsEnabled = enabled => {
  soundsEnabled = enabled;
};

export const areSoundsEnabled = () => soundsEnabled;

export const releaseSounds = () => {
  if (whistleSound) {
    whistleSound.release();
    whistleSound = null;
  }
  if (celebrationSound) {
    celebrationSound.release();
    celebrationSound = null;
  }
};
