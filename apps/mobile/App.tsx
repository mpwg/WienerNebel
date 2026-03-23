import { SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import { designTokens } from "@wiener-nebel/ui-tokens";

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.eyebrow}>Expo Client</Text>
        <Text style={styles.title}>Wiener Nebel</Text>
        <Text style={styles.copy}>
          Die mobile App nutzt denselben visuellen Kern und dieselben
          Server-Verträge wie die Web/PWA.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: designTokens.colors.accent
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: designTokens.colors.canvas,
    justifyContent: "center"
  },
  eyebrow: {
    marginBottom: 12,
    color: designTokens.colors.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase"
  },
  title: {
    color: designTokens.colors.text,
    fontFamily: "Georgia",
    fontSize: 42,
    fontWeight: "700",
    lineHeight: 46
  },
  copy: {
    marginTop: 16,
    color: designTokens.colors.textMuted,
    fontSize: 18,
    lineHeight: 28
  }
});
