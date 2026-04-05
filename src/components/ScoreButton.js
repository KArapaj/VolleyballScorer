import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Vibration,
} from 'react-native';
import {colors} from '../constants/colors';

const ScoreButton = ({
  score,
  onIncrease,
  teamName,
  onNamePress,
  teamColor,
  isServing,
}) => {
  const {width, height} = useWindowDimensions();
  const prevScoreRef = useRef(score);

  // Score animation
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const scoreOpacity = useRef(new Animated.Value(1)).current;

  // Ripple animation states
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const ripplePosition = useRef({x: 0, y: 0});
  const showRipple = useRef(false);

  // Calculate responsive sizes based on screen dimensions
  const isLandscape = width > height;
  const baseSize = Math.min(width, height);
  const buttonWidth = isLandscape ? (width - 150) * 0.38 : Math.min(width * 0.38, 160);
  const buttonHeight = isLandscape ? baseSize * 0.6 : buttonWidth * 1.15;
  const fontSize = Math.min(buttonWidth * 0.45, 72);
  const teamNameSize = Math.min(buttonWidth * 0.11, 16);
  const rippleSize = Math.max(buttonWidth, buttonHeight) * 2.5;

  // Animate score changes
  useEffect(() => {
    if (score !== prevScoreRef.current) {
      const direction = score > prevScoreRef.current ? -1 : 1; // -1 for up, 1 for down

      // Reset and animate
      scoreAnim.setValue(direction * 30);
      scoreOpacity.setValue(0.3);

      Animated.parallel([
        Animated.spring(scoreAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(scoreOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      prevScoreRef.current = score;
    }
  }, [score]);

  const triggerRipple = (x, y) => {
    ripplePosition.current = {x, y};
    showRipple.current = true;

    rippleAnim.setValue(0);
    rippleOpacity.setValue(0.3);

    Animated.parallel([
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      showRipple.current = false;
    });
  };

  const handlePress = (event) => {
    Vibration.vibrate(10);
    const touchX = event.nativeEvent.locationX;
    const touchY = event.nativeEvent.locationY;
    triggerRipple(touchX, touchY);
    onIncrease();
  };

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onNamePress} activeOpacity={0.7}>
        <View style={styles.teamNameRow}>
          {isServing && (
            <Text style={[styles.serveIndicator, {color: teamColor || colors.primary}]}>
              🏐
            </Text>
          )}
          <Text
            style={[
              styles.teamName,
              {fontSize: teamNameSize, color: teamColor || colors.primary},
            ]}>
            {teamName}
          </Text>
          {isServing && (
            <Text style={[styles.serveIndicator, {color: teamColor || colors.primary}]}>
              🏐
            </Text>
          )}
        </View>
        <Text style={[styles.editHint, {fontSize: teamNameSize * 0.6}]}>tap to edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.95}
        style={[
          styles.scoreContainer,
          {
            width: buttonWidth,
            height: buttonHeight,
            borderColor: teamColor || colors.primary,
            borderWidth: 3,
          },
        ]}>
        {/* Ripple effect */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ripple,
            {
              width: rippleSize,
              height: rippleSize,
              borderRadius: rippleSize / 2,
              backgroundColor: teamColor || colors.primary,
              left: ripplePosition.current.x - rippleSize / 2,
              top: ripplePosition.current.y - rippleSize / 2,
              opacity: rippleOpacity,
              transform: [{scale: rippleScale}],
            },
          ]}
        />

        {/* Animated Score */}
        <Animated.Text
          style={[
            styles.scoreText,
            {
              fontSize,
              transform: [{translateY: scoreAnim}],
              opacity: scoreOpacity,
            },
          ]}>
          {score}
        </Animated.Text>

        {/* Tap hint at bottom */}
        <Text style={[styles.tapHint, {color: teamColor || colors.primary}]}>
          tap to score
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  teamNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  serveIndicator: {
    fontSize: 14,
  },
  teamName: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  editHint: {
    color: colors.primary,
    opacity: 0.4,
    textAlign: 'center',
    marginBottom: 8,
  },
  scoreContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    zIndex: 5,
  },
  scoreText: {
    fontWeight: '700',
    color: colors.text,
  },
  tapHint: {
    position: 'absolute',
    bottom: '8%',
    fontSize: 10,
    opacity: 0.4,
    fontWeight: '500',
  },
});

export default ScoreButton;
