import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colors} from '../constants/colors';

const RESULTS_KEY = '@volleyball_results';

const ResultsScreen = () => {
  const [results, setResults] = useState([]);
  const {width, height} = useWindowDimensions();
  const isLandscape = width > height;
  const numColumns = isLandscape ? 2 : 1;

  // Load results when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadResults();
    }, [])
  );

  const loadResults = async () => {
    try {
      const saved = await AsyncStorage.getItem(RESULTS_KEY);
      if (saved) {
        setResults(JSON.parse(saved));
      } else {
        setResults([]);
      }
    } catch (error) {
      console.log('Error loading results:', error);
      setResults([]);
    }
  };

  const deleteResult = async (id) => {
    Alert.alert(
      'Delete Result',
      'Are you sure you want to delete this result?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedResults = results.filter(r => r.id !== id);
              await AsyncStorage.setItem(RESULTS_KEY, JSON.stringify(updatedResults));
              setResults(updatedResults);
            } catch (error) {
              console.log('Error deleting result:', error);
            }
          },
        },
      ],
    );
  };

  const clearAllResults = () => {
    Alert.alert(
      'Clear All Results',
      'Are you sure you want to delete all saved results? This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(RESULTS_KEY);
              setResults([]);
            } catch (error) {
              console.log('Error clearing results:', error);
            }
          },
        },
      ],
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderResultItem = ({item}) => {
    const winner = item.team1Sets > item.team2Sets ? item.team1Name :
                   item.team2Sets > item.team1Sets ? item.team2Name : 'Tie';

    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Text style={styles.dateText}>{formatDate(item.savedAt)}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteResult(item.id)}>
            <Text style={styles.deleteButtonText}>X</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.teamsContainer}>
          <View style={styles.teamInfo}>
            <Text style={[
              styles.teamName,
              item.team1Sets > item.team2Sets && styles.winnerText
            ]}>
              {item.team1Name}
            </Text>
            <Text style={styles.setsText}>{item.team1Sets}</Text>
          </View>

          <Text style={styles.vsText}>vs</Text>

          <View style={styles.teamInfo}>
            <Text style={[
              styles.teamName,
              item.team2Sets > item.team1Sets && styles.winnerText
            ]}>
              {item.team2Name}
            </Text>
            <Text style={styles.setsText}>{item.team2Sets}</Text>
          </View>
        </View>

        <View style={styles.resultFooter}>
          <Text style={styles.targetText}>Playing to {item.targetScore}</Text>
          {winner !== 'Tie' && (
            <Text style={styles.winnerLabel}>{winner} won</Text>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No saved results yet</Text>
      <Text style={styles.emptySubtext}>
        Save a game from the scoring screen{'\n'}to see it here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {results.length > 0 && (
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{results.length} saved game{results.length !== 1 ? 's' : ''}</Text>
          <TouchableOpacity onPress={clearAllResults}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        key={numColumns}
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <View style={[styles.resultCardWrapper, isLandscape && styles.resultCardWrapperLandscape]}>
            {renderResultItem({item})}
          </View>
        )}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={results.length === 0 ? styles.emptyListContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
        numColumns={numColumns}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.6,
  },
  clearAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  resultCardWrapper: {
    flex: 1,
  },
  resultCardWrapperLandscape: {
    flex: 0.5,
    paddingHorizontal: 4,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.text,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.5,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    opacity: 0.5,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamInfo: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  winnerText: {
    color: colors.gold,
  },
  setsText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  vsText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.4,
    paddingHorizontal: 16,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.background,
    paddingTop: 12,
  },
  targetText: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.5,
  },
  winnerLabel: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.5,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ResultsScreen;
