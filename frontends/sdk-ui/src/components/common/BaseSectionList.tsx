import React, { useMemo } from 'react';
import {
  SectionList,
  SectionListProps,
  RefreshControl,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ListEmpty } from './ListEmpty';

interface BaseSectionListProps<T, SectionT = any> extends SectionListProps<T, SectionT> {
  onRefresh?: () => void;
  refreshing?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  ListEmptyComponent?: React.ReactElement | null;
}

export function BaseSectionList<T, SectionT = any>({
  sections,
  renderItem,
  onRefresh,
  refreshing = false,
  contentContainerStyle,
  ListEmptyComponent,
  ...props
}: BaseSectionListProps<T, SectionT>) {
  const renderRefreshControl = useMemo(() => {
    if (!onRefresh) return undefined;
    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    );
  }, [onRefresh, refreshing]);

  return (
    <SectionList
      sections={sections}
      renderItem={renderItem}
      refreshControl={renderRefreshControl}
      ListEmptyComponent={ListEmptyComponent || <ListEmpty />}
      contentContainerStyle={[{ paddingBottom: 20 }, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={true}
      {...props}
    />
  );
}
