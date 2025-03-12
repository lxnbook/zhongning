import React, { useState, useEffect, useRef } from 'react';
import { List, Spin } from 'antd';
import { VariableSizeList as VList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';

const VirtualList = ({
  fetchData,
  renderItem,
  itemKey = 'id',
  pageSize = 20,
  threshold = 5,
  itemHeight = 73,
  emptyText = '暂无数据',
  loadingText = '加载中...'
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  
  const listRef = useRef();
  const infiniteLoaderRef = useRef();
  
  // 加载数据
  const loadMoreItems = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const response = await fetchData(page, pageSize);
      const newItems = response.data || [];
      const total = response.total || 0;
      
      setItems(prev => [...prev, ...newItems]);
      setTotalCount(total);
      setHasMore(items.length + newItems.length < total);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载
  useEffect(() => {
    loadMoreItems();
  }, []);
  
  // 判断项目是否已加载
  const isItemLoaded = index => {
    return !hasMore || index < items.length;
  };
  
  // 渲染列表项
  const Row = ({ index, style }) => {
    if (!isItemLoaded(index)) {
      return (
        <div style={style}>
          <List.Item>
            <Spin size="small" /> {loadingText}
          </List.Item>
        </div>
      );
    }
    
    const item = items[index];
    return (
      <div style={style}>
        {renderItem(item, index)}
      </div>
    );
  };
  
  // 如果没有数据
  if (items.length === 0 && !loading && !hasMore) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        {emptyText}
      </div>
    );
  }
  
  return (
    <AutoSizer>
      {({ height, width }) => (
        <InfiniteLoader
          ref={infiniteLoaderRef}
          isItemLoaded={isItemLoaded}
          itemCount={hasMore ? items.length + threshold : items.length}
          loadMoreItems={loadMoreItems}
          threshold={threshold}
        >
          {({ onItemsRendered, ref }) => (
            <VList
              ref={listRef}
              height={height}
              width={width}
              itemCount={hasMore ? items.length + 1 : items.length}
              itemSize={() => itemHeight}
              onItemsRendered={onItemsRendered}
            >
              {Row}
            </VList>
          )}
        </InfiniteLoader>
      )}
    </AutoSizer>
  );
};

export default VirtualList; 