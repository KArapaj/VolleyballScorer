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

const MatchWinModal = ({
  visible,
  winningTeamName,
  winningTeamColor,
  team1Sets,
  team2Sets,
  onNewMatch,
  onSaveAndExit,
}) => {
  const handleNewMatch = () => {
    Vibration.vibrate(10);
    onNewMatch();
  };

  const handleSaveAndExit = () => {
    Vibration.vibrate(10);
    onSaveAndExit();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.trophyEmoji}>🏆</Text>
          <Text style={styles.title}>Match Winner!</Text>
          <Text style={[styles.winnerText, {color: winningTeamColor}]}>
            {winningTeamName}
          </Text>
          <Text style={styles.scoreText}>
            {team1Sets} - {team2Sets}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSaveAndExit}
              activeOpacity={0.8}>
              <Text style={styles.secondaryButtonText}>Save & Exit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, {backgroundColor: winningTeamColor}]}
              onPress={handleNewMatch}
              activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>New Match</Text>
            </TouchableOpacity>
          </View>
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
  trophyEmoji: {
    fontSize: 72,
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
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 28,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});

export default MatchWinModal;
