import { Image, Text, StyleSheet, View, TouchableOpacity } from "react-native";
import SvgComponent from "../assets/svg";

import { BlurView } from "expo-blur";

export default function EmptyState() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <SvgComponent />

    
      <BlurView   tint="dark" intensity={40}  style={styles.blurredContainer}>
        <Image
          source={require("../assets/nofoto.gif")}
          style={{ width: 150, height: 130 }}
        />
      </BlurView>
    </View>
  );
}
const styles = StyleSheet.create({
  blurredContainer: {
    margin: 80,
    width: "40%",
    height: "13%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    overflow: "hidden",
  },
  innerContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    overflow: "hidden",
  },
});
