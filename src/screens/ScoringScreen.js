import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  ScrollView,
  Vibration,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import KeepAwake from 'react-native-keep-awake';
import {colors} from '../constants/colors';
import ScoreButton from '../components/ScoreButton';
import SetIndicator from '../components/SetIndicator';
import CoinToss from '../components/CoinToss';
import TimeoutIndicator from '../components/TimeoutIndicator';
import ConfirmModal from '../components/ConfirmModal';
import SetWinModal from '../components/SetWinModal';
import TimeoutOverlay from '../components/TimeoutOverlay';
import MatchWinModal from '../components/MatchWinModal';
import {initSounds, playWhistle, playCelebration, releaseSounds} from '../utils/SoundManager';

const STORAGE_KEY = '@volleyball_game';
const RESULTS_KEY = '@volleyball_results';

const ScoringScreen = ({route, navigation}) => {
  const {targetScore, continueGame, matchMode = 'endless', setsToWin = null} = route.params;
  const {width, height} = useWindowDimensions();
  const isLandscape = width > height;

  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [team1Sets, setTeam1Sets] = useState(0);
  const [team2Sets, setTeam2Sets] = useState(0);
  const [team1Name, setTeam1Name] = useState('Team 1');
  const [team2Name, setTeam2Name] = useState('Team 2');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [tempName, setTempName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Serve state
  const [servingTeam, setServingTeam] = useState(null);
  const [showCoinToss, setShowCoinToss] = useState(false);

  // Timeout state (2 per team per set)
  const [team1Timeouts, setTeam1Timeouts] = useState(2);
  const [team2Timeouts, setTeam2Timeouts] = useState(2);

  // Action history for undo (max 20 actions)
  const [actionHistory, setActionHistory] = useState([]);

  // Modal states
  const [showSetWinModal, setShowSetWinModal] = useState(false);
  const [setWinData, setSetWinData] = useState(null);
  const [scoringBlocked, setScoringBlocked] = useState(false);
  const [showTimeoutOverlay, setShowTimeoutOverlay] = useState(false);
  const [timeoutTeamData, setTimeoutTeamData] = useState(null);
  const [showMatchWinModal, setShowMatchWinModal] = useState(false);
  const [matchWinner, setMatchWinner] = useState(null);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Keep screen awake and hide status bar in landscape
  useEffect(() => {
    KeepAwake.activate();
    StatusBar.setHidden(isLandscape);
    return () => {
      KeepAwake.deactivate();
      StatusBar.setHidden(false);
    };
  }, [isLandscape]);

  // Initialize sounds
  useEffect(() => {
    initSounds();
    return () => releaseSounds();
  }, []);

  // Load saved game on mount if continuing
  useEffect(() => {
    const loadGame = async () => {
      if (continueGame) {
        try {
          const savedGame = await AsyncStorage.getItem(STORAGE_KEY);
          if (savedGame) {
            const data = JSON.parse(savedGame);
            setTeam1Score(data.team1Score || 0);
            setTeam2Score(data.team2Score || 0);
            setTeam1Sets(data.team1Sets || 0);
            setTeam2Sets(data.team2Sets || 0);
            setTeam1Name(data.team1Name || 'Team 1');
            setTeam2Name(data.team2Name || 'Team 2');
            setServingTeam(data.servingTeam || null);
          }
        } catch (error) {
          console.log('Error loading game:', error);
        }
      }
      setIsLoaded(true);
    };
    loadGame();
  }, [continueGame]);

  // Show coin toss if no serving team is set
  useEffect(() => {
    if (isLoaded && servingTeam === null) {
      setShowCoinToss(true);
    }
  }, [isLoaded, servingTeam]);

  // Auto-save game whenever state changes
  const saveGame = useCallback(async () => {
    if (!isLoaded) return;
    try {
      const gameData = {
        team1Score,
        team2Score,
        team1Sets,
        team2Sets,
        team1Name,
        team2Name,
        servingTeam,
        targetScore,
        matchMode,
        setsToWin,
        savedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(gameData));
    } catch (error) {
      console.log('Error saving game:', error);
    }
  }, [team1Score, team2Score, team1Sets, team2Sets, team1Name, team2Name, servingTeam, targetScore, matchMode, setsToWin, isLoaded]);

  useEffect(() => {
    saveGame();
  }, [saveGame]);

  // Clear saved game
  const clearSavedGame = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.log('Error clearing game:', error);
    }
  };

  // Save game to results
  const saveGameToResults = async () => {
    try {
      const existingResults = await AsyncStorage.getItem(RESULTS_KEY);
      const results = existingResults ? JSON.parse(existingResults) : [];

      const newResult = {
        id: Date.now().toString(),
        team1Name,
        team2Name,
        team1Sets,
        team2Sets,
        team1Score,
        team2Score,
        targetScore,
        savedAt: new Date().toISOString(),
      };

      results.unshift(newResult);
      await AsyncStorage.setItem(RESULTS_KEY, JSON.stringify(results));

      Alert.alert('Game Saved!', 'Your game has been saved to Results.');
    } catch (error) {
      console.log('Error saving to results:', error);
      Alert.alert('Error', 'Failed to save game.');
    }
  };

  const handleSaveGame = () => {
    Alert.alert(
      'Save Game',
      'Save this game to your results?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Save', onPress: saveGameToResults},
      ],
    );
  };

  const openEditModal = (teamNumber) => {
    setEditingTeam(teamNumber);
    setTempName(teamNumber === 1 ? team1Name : team2Name);
    setEditModalVisible(true);
  };

  const saveTeamName = () => {
    const trimmedName = tempName.trim() || (editingTeam === 1 ? 'Team 1' : 'Team 2');
    if (editingTeam === 1) {
      setTeam1Name(trimmedName);
    } else {
      setTeam2Name(trimmedName);
    }
    setEditModalVisible(false);
  };

  // Handle coin toss result
  const handleCoinTossResult = (team) => {
    setServingTeam(team);
    setShowCoinToss(false);
  };

  // Check for set win condition
  useEffect(() => {
    checkSetWin();
  }, [team1Score, team2Score]);

  const checkSetWin = () => {
    if (scoringBlocked) return;

    const hasReachedTarget = score => score >= targetScore;
    const hasTwoPointLead = (score1, score2) => Math.abs(score1 - score2) >= 2;

    // Team 1 wins set
    if (
      hasReachedTarget(team1Score) &&
      team1Score > team2Score &&
      hasTwoPointLead(team1Score, team2Score)
    ) {
      setScoringBlocked(true);
      const newSetCount = team1Sets + 1;
      setSetWinData({
        winningTeam: 1,
        winningTeamName: team1Name,
        winningTeamColor: colors.team1,
        setNumber: newSetCount,
      });
      Vibration.vibrate([0, 50, 100, 50]);
      playCelebration();
      setShowSetWinModal(true);
      return;
    }

    // Team 2 wins set
    if (
      hasReachedTarget(team2Score) &&
      team2Score > team1Score &&
      hasTwoPointLead(team1Score, team2Score)
    ) {
      setScoringBlocked(true);
      const newSetCount = team2Sets + 1;
      setSetWinData({
        winningTeam: 2,
        winningTeamName: team2Name,
        winningTeamColor: colors.team2,
        setNumber: newSetCount,
      });
      Vibration.vibrate([0, 50, 100, 50]);
      playCelebration();
      setShowSetWinModal(true);
      return;
    }
  };

  // Handle set win continue
  const handleSetWinContinue = () => {
    if (setWinData.winningTeam === 1) {
      setTeam1Sets(prev => prev + 1);
    } else {
      setTeam2Sets(prev => prev + 1);
    }
    resetScores();
    setShowSetWinModal(false);
    setSetWinData(null);
    setScoringBlocked(false);
  };

  // Check for match win
  useEffect(() => {
    if (matchMode === 'endless' || !setsToWin) return;

    if (team1Sets >= setsToWin && !showMatchWinModal) {
      setMatchWinner({
        teamName: team1Name,
        teamColor: colors.team1,
        teamNumber: 1,
      });
      playCelebration();
      Vibration.vibrate([0, 100, 100, 100, 100, 100]);
      setShowMatchWinModal(true);
    } else if (team2Sets >= setsToWin && !showMatchWinModal) {
      setMatchWinner({
        teamName: team2Name,
        teamColor: colors.team2,
        teamNumber: 2,
      });
      playCelebration();
      Vibration.vibrate([0, 100, 100, 100, 100, 100]);
      setShowMatchWinModal(true);
    }
  }, [team1Sets, team2Sets]);

  const resetScores = () => {
    setTeam1Score(0);
    setTeam2Score(0);
    setTeam1Timeouts(2);
    setTeam2Timeouts(2);
    setActionHistory([]);
  };

  // Record action for undo functionality
  const recordAction = (type, team, data) => {
    setActionHistory(prev => [
      {type, team, data, timestamp: Date.now()},
      ...prev.slice(0, 19), // Keep last 20 actions
    ]);
  };

  // Undo last action
  const undoLastAction = () => {
    if (actionHistory.length === 0) return;

    const lastAction = actionHistory[0];
    Vibration.vibrate(10);

    switch (lastAction.type) {
      case 'score_increase':
        if (lastAction.team === 1) {
          setTeam1Score(lastAction.data.previousScore);
        } else {
          setTeam2Score(lastAction.data.previousScore);
        }
        // Restore serve state if it changed
        if (lastAction.data.previousServe !== undefined) {
          setServingTeam(lastAction.data.previousServe);
        }
        break;
      case 'score_decrease':
        if (lastAction.team === 1) {
          setTeam1Score(lastAction.data.previousScore);
        } else {
          setTeam2Score(lastAction.data.previousScore);
        }
        break;
      case 'timeout_used':
        if (lastAction.team === 1) {
          setTeam1Timeouts(lastAction.data.previousTimeouts);
        } else {
          setTeam2Timeouts(lastAction.data.previousTimeouts);
        }
        break;
    }

    setActionHistory(prev => prev.slice(1));
  };

  // Timeout handlers
  const startTimeout = (teamNumber) => {
    const teamName = teamNumber === 1 ? team1Name : team2Name;
    const teamColor = teamNumber === 1 ? colors.team1 : colors.team2;
    const currentTimeouts = teamNumber === 1 ? team1Timeouts : team2Timeouts;

    if (currentTimeouts <= 0) {
      Alert.alert('No Timeouts', `${teamName} has no timeouts remaining.`);
      return;
    }

    // Record for undo
    recordAction('timeout_used', teamNumber, {previousTimeouts: currentTimeouts});

    // Decrement timeout count
    if (teamNumber === 1) {
      setTeam1Timeouts(prev => prev - 1);
    } else {
      setTeam2Timeouts(prev => prev - 1);
    }

    Vibration.vibrate([0, 30, 50, 30]);
    setTimeoutTeamData({teamNumber, teamName, teamColor});
    setShowTimeoutOverlay(true);
  };

  const handleTimeoutEnd = () => {
    setShowTimeoutOverlay(false);
    setTimeoutTeamData(null);
  };

  const resetSet = () => {
    setShowResetModal(true);
  };

  const handleResetConfirm = () => {
    setShowResetModal(false);
    resetScores();
  };

  const newGame = () => {
    setShowNewGameModal(true);
  };

  const handleNewGameConfirm = async () => {
    setShowNewGameModal(false);
    resetScores();
    setTeam1Sets(0);
    setTeam2Sets(0);
    setTeam1Name('Team 1');
    setTeam2Name('Team 2');
    setServingTeam(null);
    setShowCoinToss(true);
    await clearSavedGame();
  };

  const handleMatchNewGame = async () => {
    setShowMatchWinModal(false);
    setMatchWinner(null);
    resetScores();
    setTeam1Sets(0);
    setTeam2Sets(0);
    setServingTeam(null);
    setShowCoinToss(true);
    await clearSavedGame();
  };

  const handleMatchSaveAndExit = async () => {
    setShowMatchWinModal(false);
    await saveGameToResults();
    await clearSavedGame();
    navigation.goBack();
  };

  // Rally scoring: serve changes when receiving team scores
  const increaseTeam1 = () => {
    if (scoringBlocked) return;
    const previousServe = servingTeam === 2 ? 2 : undefined;
    recordAction('score_increase', 1, {previousScore: team1Score, previousServe});
    playWhistle();
    setTeam1Score(prev => prev + 1);
    // If team 1 was receiving (team 2 was serving), serve switches to team 1
    if (servingTeam === 2) {
      setServingTeam(1);
    }
  };

  const increaseTeam2 = () => {
    if (scoringBlocked) return;
    const previousServe = servingTeam === 1 ? 1 : undefined;
    recordAction('score_increase', 2, {previousScore: team2Score, previousServe});
    playWhistle();
    setTeam2Score(prev => prev + 1);
    // If team 2 was receiving (team 1 was serving), serve switches to team 2
    if (servingTeam === 1) {
      setServingTeam(2);
    }
  };

  // Get background color based on serving team
  const getBackgroundColor = () => {
    if (servingTeam === 1) return colors.team1Light;
    if (servingTeam === 2) return colors.team2Light;
    return colors.background;
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: getBackgroundColor()}]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isLandscape && styles.scrollContentLandscape
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main content wrapper for landscape */}
        <View style={[
          styles.mainContent,
          isLandscape && styles.mainContentLandscape
        ]}>
          {/* Left side in landscape: Set indicators */}
          <View style={[
            styles.setIndicatorsContainer,
            isLandscape && styles.setIndicatorsLandscape
          ]}>
            <SetIndicator setsWon={team1Sets} teamName="Sets" teamColor={colors.team1} matchMode={matchMode} />
            <View style={styles.targetContainer}>
              <Text style={styles.targetLabel}>Playing to</Text>
              <Text style={styles.targetScore}>{targetScore}</Text>
            </View>
            <SetIndicator setsWon={team2Sets} teamName="Sets" teamColor={colors.team2} matchMode={matchMode} />
          </View>

          {/* Score Display */}
          <View style={[
            styles.scoreSection,
            isLandscape && styles.scoreSectionLandscape
          ]}>
            <View style={styles.teamContainer}>
              <ScoreButton
                score={team1Score}
                onIncrease={increaseTeam1}
                teamName={team1Name}
                onNamePress={() => openEditModal(1)}
                teamColor={colors.team1}
                isServing={servingTeam === 1}
              />
              <TimeoutIndicator
                timeoutsLeft={team1Timeouts}
                teamColor={colors.team1}
                teamName={team1Name}
                onUseTimeout={() => startTimeout(1)}
              />
            </View>

            <View style={styles.vsContainer}>
              <Text style={[styles.vsText, isLandscape && {fontSize: 18}]}>VS</Text>
            </View>

            <View style={styles.teamContainer}>
              <ScoreButton
                score={team2Score}
                onIncrease={increaseTeam2}
                teamName={team2Name}
                onNamePress={() => openEditModal(2)}
                teamColor={colors.team2}
                isServing={servingTeam === 2}
              />
              <TimeoutIndicator
                timeoutsLeft={team2Timeouts}
                teamColor={colors.team2}
                teamName={team2Name}
                onUseTimeout={() => startTimeout(2)}
              />
            </View>
          </View>
        </View>

        {/* Hint text */}
        <Text style={[styles.hintText, isLandscape && styles.hintTextLandscape]}>
          Tap score to add point | Use Undo to correct | Tap TO for timeout
        </Text>

        {/* Control Buttons */}
        <View style={[
          styles.controlButtonsRow,
          isLandscape && styles.controlButtonsLandscape
        ]}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.undoButton,
              actionHistory.length === 0 && styles.undoButtonDisabled,
            ]}
            onPress={undoLastAction}
            disabled={actionHistory.length === 0}
            activeOpacity={0.8}>
            <Text style={[
              styles.controlButtonText,
              styles.undoButtonText,
              actionHistory.length === 0 && styles.undoButtonTextDisabled,
            ]}>
              Undo {actionHistory.length > 0 ? `(${actionHistory.length})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={resetSet}
            activeOpacity={0.8}>
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.saveGameButton]}
            onPress={handleSaveGame}
            activeOpacity={0.8}>
            <Text style={[styles.controlButtonText, styles.saveGameButtonText]}>
              Save
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.newGameButton]}
            onPress={newGame}
            activeOpacity={0.8}>
            <Text style={[styles.controlButtonText, styles.newGameButtonText]}>
              New
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Coin Toss Modal */}
      <CoinToss
        visible={showCoinToss}
        onResult={handleCoinTossResult}
        team1Name={team1Name}
        team2Name={team2Name}
      />

      {/* Edit Team Name Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Team Name</Text>
            <TextInput
              style={styles.modalInput}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter team name"
              placeholderTextColor={colors.text + '60'}
              maxLength={20}
              autoFocus={true}
              selectTextOnFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={saveTeamName}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Set Win Modal */}
      <SetWinModal
        visible={showSetWinModal}
        winningTeamName={setWinData?.winningTeamName}
        setNumber={setWinData?.setNumber}
        winningTeamColor={setWinData?.winningTeamColor}
        onContinue={handleSetWinContinue}
      />

      {/* Timeout Overlay */}
      <TimeoutOverlay
        visible={showTimeoutOverlay}
        teamName={timeoutTeamData?.teamName}
        teamColor={timeoutTeamData?.teamColor}
        onSkip={handleTimeoutEnd}
        onComplete={handleTimeoutEnd}
      />

      {/* Match Win Modal */}
      <MatchWinModal
        visible={showMatchWinModal}
        winningTeamName={matchWinner?.teamName}
        winningTeamColor={matchWinner?.teamColor}
        team1Sets={team1Sets}
        team2Sets={team2Sets}
        onNewMatch={handleMatchNewGame}
        onSaveAndExit={handleMatchSaveAndExit}
      />

      {/* New Game Confirmation Modal */}
      <ConfirmModal
        visible={showNewGameModal}
        title="New Game"
        message="Are you sure you want to start a new game? All progress will be lost."
        confirmText="New Game"
        cancelText="Cancel"
        onConfirm={handleNewGameConfirm}
        onCancel={() => setShowNewGameModal(false)}
        confirmDestructive={true}
      />

      {/* Reset Set Confirmation Modal */}
      <ConfirmModal
        visible={showResetModal}
        title="Reset Set"
        message="Are you sure you want to reset the current set?"
        confirmText="Reset"
        cancelText="Cancel"
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetModal(false)}
        confirmDestructive={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  scrollContentLandscape: {
    paddingBottom: 10,
  },
  mainContent: {
    flex: 1,
  },
  mainContentLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  setIndicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: colors.text,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  setIndicatorsLandscape: {
    flexDirection: 'column',
    marginHorizontal: 8,
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  targetContainer: {
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
    marginBottom: 4,
  },
  targetScore: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gold,
  },
  scoreSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  scoreSectionLandscape: {
    flex: 2,
    paddingHorizontal: 5,
    gap: 5,
  },
  teamContainer: {
    alignItems: 'center',
  },
  vsContainer: {
    paddingHorizontal: 8,
  },
  vsText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    opacity: 0.5,
  },
  hintText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.text,
    opacity: 0.4,
    marginBottom: 20,
  },
  hintTextLandscape: {
    marginBottom: 8,
    fontSize: 11,
  },
  controlButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  controlButtonsLandscape: {
    paddingHorizontal: 10,
    paddingBottom: 8,
    gap: 8,
  },
  controlButton: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  saveGameButton: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  saveGameButtonText: {
    color: colors.white,
  },
  newGameButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  newGameButtonText: {
    color: colors.white,
  },
  undoButton: {
    backgroundColor: colors.white,
    borderColor: colors.text,
  },
  undoButtonDisabled: {
    opacity: 0.4,
    borderColor: colors.text + '60',
  },
  undoButtonText: {
    color: colors.text,
  },
  undoButtonTextDisabled: {
    color: colors.text + '60',
  },
  fullWidthButton: {
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default ScoringScreen;
