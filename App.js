import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import SetCountScreen from './src/screens/SetCountScreen';
import SetLengthScreen from './src/screens/SetLengthScreen';
import ScoringScreen from './src/screens/ScoringScreen';
import ResultsScreen from './src/screens/ResultsScreen';

import {colors} from './src/constants/colors';

const Stack = createStackNavigator();

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: colors.primary,
              },
              headerTintColor: colors.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              headerBackTitleVisible: false,
            }}>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="SetCount"
              component={SetCountScreen}
              options={{title: 'Match Format'}}
            />
            <Stack.Screen
              name="SetLength"
              component={SetLengthScreen}
              options={{title: 'Set Length'}}
            />
            <Stack.Screen
              name="Scoring"
              component={ScoringScreen}
              options={{title: 'Score'}}
            />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{title: 'Results'}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
