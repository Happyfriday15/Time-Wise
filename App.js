import React, { useState } from "react";
import { ActivityIndicator, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { askAi } from "./lib/ai";

export default function App() {
  const [goal, setGoal] = useState("");
  const [hours, setHours] = useState("2");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function makePlan() {
    if (!goal.trim()) return setError("Tell me what you want to make time for.");
    setLoading(true); setError(""); setAnswer("");
    try {
      setAnswer(await askAi(`Help me plan ${hours || "2"} hours for this goal: ${goal.trim()}`));
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }

  const content = (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>TIME WISE</Text>
        <Text style={styles.title}>Make time for what matters.</Text>
        <Text style={styles.subtitle}>A calm little plan for the hours ahead.</Text>
        <View style={styles.card}>
          <Text style={styles.label}>WHAT DO YOU WANT TO DO?</Text>
          <TextInput value={goal} onChangeText={setGoal} placeholder="e.g. Finish my project" placeholderTextColor="#9d9a95" style={styles.input} multiline />
          <Text style={styles.label}>HOW MANY HOURS?</Text>
          <TextInput value={hours} onChangeText={setHours} keyboardType="decimal-pad" style={styles.input} />
          <Pressable onPress={makePlan} disabled={loading} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Make my plan</Text>}
          </Pressable>
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!!answer && <View style={styles.answer}><Text style={styles.answerLabel}>YOUR TIME-WISE PLAN</Text><Text style={styles.answerText}>{answer}</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );

  return Platform.OS === "web" ? <View style={styles.webStage}><View style={styles.phone}>{content}</View></View> : content;
}

const styles = StyleSheet.create({
  webStage: { flex: 1, alignItems: "center", backgroundColor: "#e9e5de" },
  phone: { width: "min(400px, 100%)", height: "100%", overflow: "hidden", backgroundColor: "#f8f6f2", shadowColor: "#38342e", shadowOpacity: 0.16, shadowRadius: 30, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  safe: { flex: 1, backgroundColor: "#f8f6f2" },
  content: { flexGrow: 1, padding: 28, paddingTop: 54 },
  eyebrow: { color: "#b26b4d", fontSize: 12, fontWeight: "800", letterSpacing: 2 },
  title: { color: "#292723", fontSize: 34, lineHeight: 39, fontWeight: "700", marginTop: 18 },
  subtitle: { color: "#77716a", fontSize: 16, lineHeight: 23, marginTop: 12 },
  card: { backgroundColor: "#fff", borderRadius: 22, padding: 20, marginTop: 32, shadowColor: "#5e5148", shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  label: { color: "#8d857d", fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 9, marginTop: 4 },
  input: { backgroundColor: "#f5f2ed", borderRadius: 12, color: "#292723", fontSize: 16, minHeight: 48, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 18 },
  button: { alignItems: "center", backgroundColor: "#b26b4d", borderRadius: 13, minHeight: 52, justifyContent: "center", marginTop: 2 },
  buttonPressed: { opacity: 0.85 }, buttonDisabled: { opacity: 0.6 }, buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  error: { color: "#a33f3f", fontSize: 14, marginTop: 16 },
  answer: { backgroundColor: "#e8eee6", borderRadius: 22, padding: 22, marginTop: 22 },
  answerLabel: { color: "#60755e", fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 11 },
  answerText: { color: "#303b2e", fontSize: 16, lineHeight: 25 },
});
