import React, {useMemo} from 'react';
import {
  FlatList,
  FlatListProps,
  RefreshControl,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {ListEmpty} from './ListEmpty';

interface BaseListProps<T> extends FlatListProps<T> {
  onRefresh?: () => void;
  refreshing?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  ListEmptyComponent?: React.ReactElement | null;
}

export function BaseList<T>({
  data,
  renderItem,
  onRefresh,
  refreshing = false,
  contentContainerStyle,
  ListEmptyComponent,
  ...props
}: BaseListProps<T>) {
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
    <FlatList
      data={data}
      renderItem={renderItem}
      refreshControl={renderRefreshControl}
      ListEmptyComponent={ListEmptyComponent || <ListEmpty />}
      contentContainerStyle={[{paddingBottom: 20}, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      {...props}
    />
  );
}
