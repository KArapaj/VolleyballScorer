import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Vibration,
} from 'react-native';
import {colors} from '../constants/colors';

const SetWinModal = ({
  visible,
  winningTeamName,
  setNumber,
  winningTeamColor,
  onContinue,
}) => {
  const getOrdinal = n => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  const handleContinue = () => {
    Vibration.vibrate(10);
    onContinue();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.title}>Set Won!</Text>
          <Text style={[styles.winnerText, {color: winningTeamColor}]}>
            {winningTeamName}
          </Text>
          <Text style={styles.subtitle}>won the {getOrdinal(setNumber)} set!</Text>
          <TouchableOpacity
            style={[styles.continueButton, {backgroundColor: winningTeamColor}]}
            onPress={handleContinue}
            activeOpacity={0.8}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    maxWidth: 340,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  winnerText: {
    fontSize: 24,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 18,
    color: colors.text,
    opacity: 0.7,
    marginTop: 4,
    marginBottom: 24,
  },
  continueButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SetWinModal;
