import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../constants/colors';

const SetLengthScreen = ({route, navigation}) => {
  const {matchMode = 'endless', setsToWin = null} = route.params || {};
  const setLengths = [25, 21, 15];
  const {width, height} = useWindowDimensions();
  const isLandscape = width > height;

  const handleSelectLength = targetScore => {
    navigation.navigate('Scoring', {
      targetScore,
      continueGame: false,
      matchMode,
      setsToWin,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isLandscape && styles.contentLandscape
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, isLandscape && styles.titleLandscape]}>
          How long is the set?
        </Text>

        <View style={[
          styles.buttonContainer,
          isLandscape && styles.buttonContainerLandscape
        ]}>
          {setLengths.map(length => (
            <TouchableOpacity
              key={length}
              style={[styles.choiceButton, isLandscape && styles.choiceButtonLandscape]}
              onPress={() => handleSelectLength(length)}
              activeOpacity={0.8}>
              <Text style={[styles.choiceButtonText, isLandscape && styles.choiceButtonTextLandscape]}>
                {length}
              </Text>
              <Text style={styles.choiceButtonSubtext}>points</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  contentLandscape: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 50,
  },
  titleLandscape: {
    fontSize: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
    maxWidth: 400,
  },
  buttonContainerLandscape: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    maxWidth: '100%',
  },
  choiceButton: {
    backgroundColor: colors.white,
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  choiceButtonLandscape: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    maxWidth: 150,
  },
  choiceButtonText: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: '700',
  },
  choiceButtonTextLandscape: {
    fontSize: 28,
  },
  choiceButtonSubtext: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    opacity: 0.7,
  },
});

export default SetLengthScreen;
