import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors} from '../constants/colors';

const SetIndicator = ({setsWon, matchMode = 'endless', teamName, teamColor}) => {
  const color = teamColor || colors.primary;

  // Determine number of dots based on match mode
  const getMaxDots = () => {
    switch (matchMode) {
      case 'bestOf3':
        return 2; // First to 2 wins
      case 'bestOf5':
        return 3; // First to 3 wins
      default:
        return 0; // Endless mode - no dots
    }
  };

  const maxDots = getMaxDots();
  const isEndless = matchMode === 'endless';

  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < maxDots; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.dot,
            {borderColor: color},
            i < setsWon && {backgroundColor: color},
          ]}
        />,
      );
    }
    return dots;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, {color}]}>{teamName}</Text>
      {isEndless ? (
        // Endless mode: just show the count prominently
        <View style={[styles.countBox, {borderColor: color}]}>
          <Text style={[styles.endlessCount, {color}]}>{setsWon}</Text>
        </View>
      ) : (
        // Best of 3/5: show dots and count
        <>
          <View style={styles.dotsContainer}>{renderDots()}</View>
          <Text style={[styles.count, {color}]}>{setsWon}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    minWidth: 80,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  count: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  countBox: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  endlessCount: {
    fontSize: 24,
    fontWeight: '700',
  },
});

export default SetIndicator;
