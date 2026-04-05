import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  Vibration,
} from 'react-native';
import {colors} from '../constants/colors';

const CoinToss = ({visible, onResult, team1Name, team2Name}) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [displayedTeam, setDisplayedTeam] = useState(1);

  const scaleX = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const flipCoin = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    setResult(null);
    Vibration.vibrate(20);

    // Random result: 1 or 2
    const winner = Math.random() < 0.5 ? 1 : 2;

    // Number of face switches during animation
    const totalFlips = 10;
    let currentFlip = 0;

    const doFlip = () => {
      // Animate scaleX to 0 (coin edge)
      Animated.timing(scaleX, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
        easing: Easing.linear,
      }).start(() => {
        currentFlip++;

        // Determine which face to show
        // On the last flip, show the winner
        if (currentFlip >= totalFlips) {
          setDisplayedTeam(winner);
        } else {
          // Alternate faces during flipping
          setDisplayedTeam(prev => prev === 1 ? 2 : 1);
        }

        // Animate scaleX back to 1
        Animated.timing(scaleX, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
          easing: Easing.linear,
        }).start(() => {
          if (currentFlip < totalFlips) {
            doFlip();
          } else {
            // Animation complete - show result
            // Add a little bounce at the end
            Animated.sequence([
              Animated.timing(bounceAnim, {
                toValue: 1.1,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(bounceAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
            ]).start(() => {
              setResult(winner);
              setIsFlipping(false);
              Vibration.vibrate([0, 50, 100, 50]);
            });
          }
        });
      });
    };

    doFlip();
  };

  const selectTeam = (team) => {
    Vibration.vibrate(10);
    onResult(team);
  };

  const handleSkip = () => {
    // Randomly assign serve silently and start game
    const randomTeam = Math.random() < 0.5 ? 1 : 2;
    Vibration.vibrate(10);
    onResult(randomTeam);
  };

  const isTeam1 = displayedTeam === 1;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Who Serves First?</Text>
          <Text style={styles.subtitle}>Tap the coin to flip or select a team</Text>

          {/* Coin */}
          <TouchableOpacity onPress={flipCoin} activeOpacity={0.9} disabled={isFlipping}>
            <Animated.View
              style={[
                styles.coin,
                isTeam1 ? styles.coinTeam1 : styles.coinTeam2,
                {
                  transform: [
                    {scaleX: scaleX},
                    {scale: bounceAnim},
                  ],
                },
              ]}>
              <Text style={styles.coinText}>🏐</Text>
              <Text style={[
                styles.coinTeamName,
                {color: isTeam1 ? colors.team1 : colors.team2}
              ]}>
                {isTeam1 ? team1Name : team2Name}
              </Text>
            </Animated.View>
          </TouchableOpacity>

          {/* Result display */}
          {result && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>
                {result === 1 ? team1Name : team2Name} serves first!
              </Text>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  {backgroundColor: result === 1 ? colors.team1 : colors.team2},
                ]}
                onPress={() => selectTeam(result)}>
                <Text style={styles.confirmButtonText}>Start Game</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Manual selection buttons */}
          {!isFlipping && !result && (
            <View style={styles.manualSelection}>
              <Text style={styles.orText}>Or choose manually:</Text>
              <View style={styles.teamButtons}>
                <TouchableOpacity
                  style={[styles.teamButton, {backgroundColor: colors.team1}]}
                  onPress={() => selectTeam(1)}>
                  <Text style={styles.teamButtonText}>{team1Name}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.teamButton, {backgroundColor: colors.team2}]}
                  onPress={() => selectTeam(2)}>
                  <Text style={styles.teamButtonText}>{team2Name}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isFlipping && (
            <Text style={styles.flippingText}>Flipping...</Text>
          )}

          {/* Skip button */}
          {!isFlipping && !result && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}>
              <Text style={styles.skipButtonText}>Skip - Let us decide</Text>
            </TouchableOpacity>
          )}
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.6,
    marginBottom: 24,
    textAlign: 'center',
  },
  coin: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 4,
  },
  coinTeam1: {
    backgroundColor: colors.team1Light,
    borderColor: colors.team1,
  },
  coinTeam2: {
    backgroundColor: colors.team2Light,
    borderColor: colors.team2,
  },
  coinText: {
    fontSize: 48,
  },
  coinTeamName: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  manualSelection: {
    alignItems: 'center',
    width: '100%',
  },
  orText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.5,
    marginBottom: 16,
  },
  teamButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  teamButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  teamButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  flippingText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  skipButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.5,
    textDecorationLine: 'underline',
  },
});

export default CoinToss;
