import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { colors } from "../../theme/colors";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BottomSheetProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  snapPoints?: Array<number | string>;
  children: React.ReactNode;
  indicatorShow?: boolean;
  disabled?: boolean;
  insetsBottom?: boolean;
  enableDynamicSizing?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  setOpen,
  snapPoints = ["30%"],
  children,
  indicatorShow = true,
  disabled,
  insetsBottom = true,
  enableDynamicSizing = false,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  const snapPointsMemo = useMemo(() => snapPoints, [snapPoints]);

  useEffect(() => {
    if (open) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [open]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        setOpen(false);
      }
    },
    [setOpen],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={() => setOpen(false)}
      />
    ),
    [setOpen],
  );

  const Container = enableDynamicSizing ? BottomSheetView : View;

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={enableDynamicSizing ? undefined : snapPointsMemo}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={!disabled}
      handleIndicatorStyle={styles.indicator}
      handleComponent={indicatorShow ? undefined : null}
      enableContentPanningGesture={!disabled}
      enableHandlePanningGesture={!disabled}
      enableDynamicSizing={enableDynamicSizing}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <Container
        style={[
          {
            paddingBottom: insetsBottom ? insets.bottom || 12 : 0,
          },
          !enableDynamicSizing && { flex: 1 },
        ]}
      >
        {children}
      </Container>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  indicator: {
    backgroundColor: colors.border,
    width: 40,
  },
});
