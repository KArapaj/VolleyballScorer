import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Vibration,
} from 'react-native';
import {colors} from '../constants/colors';

const TIMEOUT_DURATION = 30;

const TimeoutOverlay = ({visible, teamName, teamColor, onSkip, onComplete}) => {
  const [secondsLeft, setSecondsLeft] = useState(TIMEOUT_DURATION);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);
  const pulseAnimRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setSecondsLeft(TIMEOUT_DURATION);
      startTimer();
      startPulseAnimation();
    } else {
      stopTimer();
      stopPulseAnimation();
    }

    return () => {
      stopTimer();
      stopPulseAnimation();
    };
  }, [visible]);

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          stopTimer();
          Vibration.vibrate([0, 100, 100, 100]);
          onComplete();
          return 0;
        }
        // Vibrate at 10 seconds remaining
        if (prev === 11) {
          Vibration.vibrate(50);
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startPulseAnimation = () => {
    pulseAnimRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseAnimRef.current.start();
  };

  const stopPulseAnimation = () => {
    if (pulseAnimRef.current) {
      pulseAnimRef.current.stop();
      pulseAnim.setValue(1);
    }
  };

  const handleSkip = () => {
    stopTimer();
    Vibration.vibrate(10);
    onSkip();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.label}>TIMEOUT</Text>
          <Text style={[styles.teamName, {color: teamColor}]}>{teamName}</Text>

          <Animated.View
            style={[
              styles.timerCircle,
              {borderColor: teamColor, transform: [{scale: pulseAnim}]},
            ]}>
            <Text style={[styles.timerText, {color: teamColor}]}>
              {secondsLeft}
            </Text>
          </Animated.View>

          <TouchableOpacity
            style={[styles.skipButton, {borderColor: teamColor}]}
            onPress={handleSkip}
            activeOpacity={0.8}>
            <Text style={[styles.skipButtonText, {color: teamColor}]}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
    opacity: 0.7,
    letterSpacing: 4,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 32,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 40,
  },
  timerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 40,
  },
  timerText: {
    fontSize: 72,
    fontWeight: '700',
  },
  skipButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  skipButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TimeoutOverlay;
