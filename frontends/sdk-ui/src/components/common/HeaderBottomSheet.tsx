import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Row } from "./Layout";
import { colors } from "@/theme/colors";

interface IProps {
  butonLeft?: React.ReactNode;
  butonRight?: React.ReactNode;
  title: string;
}

export const HeaderBottomSheet = ({ butonLeft, butonRight, title }: IProps) => {
  return (
    <Row
      height={52}
      px={12}
      alignItems="center"
      justifyContent="space-between"
      borderBottomWidth={1}
      borderBottomColor={colors.border}
    >
      <View style={[styles.btn, styles.btnL]}>{butonLeft}</View>
      <Text style={{
        fontWeight: "500",
        fontSize: 16,
        color: colors.text,
      }}>{title}</Text>
      <View style={[styles.btn, styles.btnR]}>{butonRight}</View>
    </Row>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: "20%",
    flexDirection: "row",
    alignItems: "center",
  },
  btnR: {
    justifyContent: "flex-end",
  },
  btnL: {
    justifyContent: "flex-start",
  },
});
