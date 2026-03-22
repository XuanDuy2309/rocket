import { DV_HEIGHT, DV_WIDTH } from "@/common";
import React from "react";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";

export const LoadingOverlay = () => {
  return (
    <Modal
      visible={true}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <ActivityIndicator size={"large"} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: DV_WIDTH,
    height: DV_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
});
