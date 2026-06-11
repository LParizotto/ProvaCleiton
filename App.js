import { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Feather } from "@expo/vector-icons";

const randomHex = () =>
  "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0").toUpperCase();

const isLight = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
};

const newPalette = () =>
  Array.from({ length: 5 }, () => ({ color: randomHex(), locked: false }));

function ColorBlock({ item, index, onLock, onCopy }) {
  const fg = isLight(item.color) ? "#111" : "#FFF";
  const fade = useRef(new Animated.Value(0)).current;

  const handleCopy = () => {
    onCopy(item.color);
    Animated.sequence([
      Animated.timing(fade, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(fade, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={[styles.block, { backgroundColor: item.color }]}>
      <TouchableOpacity style={styles.lock} onPress={() => onLock(index)}>
        <Feather name={item.locked ? "lock" : "unlock"} size={18} color={fg} />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleCopy}>
        <Text style={[styles.hex, { color: fg }]}>{item.color}</Text>
      </TouchableOpacity>

      <Animated.Text style={[styles.copied, { color: fg, opacity: fade }]}>
        Copiado!
      </Animated.Text>
    </View>
  );
}

export default function App() {
  const [palette, setPalette] = useState(newPalette);

  const generate = () =>
    setPalette((p) => p.map((item) => (item.locked ? item : { ...item, color: randomHex() })));

  const toggleLock = (i) =>
    setPalette((p) => p.map((item, idx) => (idx === i ? { ...item, locked: !item.locked } : item)));

  const copy = (hex) => Clipboard.setStringAsync(hex);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1 }}>
        {palette.map((item, i) => (
          <ColorBlock key={i} item={item} index={i} onLock={toggleLock} onCopy={copy} />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={generate}>
        <Feather name="shuffle" size={18} color="#FFF" />
        <Text style={styles.buttonText}>Gerar Nova Paleta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#111" },
  block: { flex: 1, justifyContent: "center", alignItems: "center" },
  lock: { position: "absolute", top: 12, right: 14 },
  hex: { fontSize: 15, fontWeight: "600", letterSpacing: 2 },
  copied: { position: "absolute", bottom: 12, fontSize: 11, fontWeight: "700", letterSpacing: 1.5 },
  button: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, margin: 16, padding: 16, borderRadius: 14, backgroundColor: "#FFF",
  },
  buttonText: { color: "#111", fontSize: 15, fontWeight: "700" },
});
