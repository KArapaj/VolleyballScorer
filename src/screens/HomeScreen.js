import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colors} from '../constants/colors';

const STORAGE_KEY = '@volleyball_game';

const HomeScreen = ({navigation}) => {
  const [savedGame, setSavedGame] = useState(null);
  const {width, height} = useWindowDimensions();
  const isLandscape = width > height;

  // Check for saved game when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const checkSavedGame = async () => {
        try {
          const saved = await AsyncStorage.getItem(STORAGE_KEY);
          if (saved) {
            setSavedGame(JSON.parse(saved));
          } else {
            setSavedGame(null);
          }
        } catch (error) {
          console.log('Error checking saved game:', error);
          setSavedGame(null);
        }
      };
      checkSavedGame();
    }, [])
  );

  const continueGame = () => {
    if (savedGame) {
      navigation.navigate('Scoring', {
        targetScore: savedGame.targetScore,
        continueGame: true,
        matchMode: savedGame.matchMode || 'endless',
        setsToWin: savedGame.setsToWin || null,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isLandscape && styles.contentLandscape
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, isLandscape && styles.titleLandscape]}>
          Fancy a game today?
        </Text>

        <View style={[
          styles.buttonContainer,
          isLandscape && styles.buttonContainerLandscape
        ]}>
          {savedGame && (
            <TouchableOpacity
              style={[styles.continueButton, isLandscape && styles.buttonLandscape]}
              onPress={continueGame}
              activeOpacity={0.8}>
              <Text style={styles.continueButtonText}>Continue Game</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, isLandscape && styles.buttonLandscape]}
            onPress={() => navigation.navigate('SetCount')}
            activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>
              {savedGame ? 'New Game' : 'Start Scoring'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, isLandscape && styles.buttonLandscape]}
            onPress={() => navigation.navigate('Results')}
            activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>Results</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.comingSoonButton, isLandscape && styles.buttonLandscape]}
            disabled={true}
            activeOpacity={1}>
            <Text style={styles.comingSoonButtonText}>Coming Soon</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 60,
    paddingVertical: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 60,
  },
  titleLandscape: {
    fontSize: 24,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    maxWidth: 400,
  },
  buttonContainerLandscape: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    maxWidth: '100%',
  },
  buttonLandscape: {
    flex: 1,
    minWidth: 150,
    maxWidth: 200,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: colors.gold,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  continueSubtext: {
    color: colors.white,
    fontSize: 12,
    opacity: 0.9,
    marginTop: 4,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  comingSoonButton: {
    backgroundColor: colors.white,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.text,
    opacity: 0.3,
  },
  comingSoonButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HomeScreen;
