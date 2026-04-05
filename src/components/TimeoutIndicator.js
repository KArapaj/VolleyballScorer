import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Vibration} from 'react-native';
import {colors} from '../constants/colors';

const TimeoutIndicator = ({timeoutsLeft, teamColor, onUseTimeout, disabled}) => {
  const color = teamColor || colors.primary;

  const handlePress = () => {
    Vibration.vibrate(10);
    onUseTimeout();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.container, {borderColor: color}]}>
      <Text style={[styles.label, {color}]}>TO</Text>
      <View style={styles.dotsContainer}>
        {[0, 1].map(index => (
          <View
            key={index}
            style={[
              styles.dot,
              {borderColor: color},
              index < timeoutsLeft && {backgroundColor: color},
            ]}
          />
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: colors.white,
    marginTop: 8,
    shadowColor: colors.text,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
});

export default TimeoutIndicator;
