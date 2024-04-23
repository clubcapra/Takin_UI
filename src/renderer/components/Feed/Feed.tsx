import { Select } from '@/renderer/components/common/Select';
import { CameraFeed } from '@/renderer/components/Feed/Feeds/CameraFeed';
import { GraphFeed } from '@/renderer/components/Feed/Feeds/GraphFeed';
import { TextFeed } from '@/renderer/components/Feed/Feeds/TextFeed';
import { UrdfFeed } from '@/renderer/components/Feed/Feeds/UrdfFeed';
import { PedroFeed } from '@/renderer/components/Feed/Feeds/PedroFeed';
import { styled } from '@/renderer/globalStyles/styled';
import {
  feedSlice,
  FeedType,
  FeedTypeEnum,
  selectAllFeeds,
  selectFeedFromFeedMap,
} from '@/renderer/store/modules/feed';
import { useOpenClose } from '@/renderer/hooks/useOpenClose';
import React, { ChangeEvent, FC, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EmptyFeed } from '@/renderer/components/Feed/Feeds/EmptyFeed';

export const Feed: FC<{
  feed_id: string;
  defaultFeed?: string;
}> = ({ feed_id, defaultFeed }) => {
  const [isMouseOver, onOver, onLeave] = useOpenClose();

  const mappedFeed = useSelector(selectFeedFromFeedMap(feed_id));
  const allFeeds = useSelector(selectAllFeeds);

  const feed = useMemo(() => {
    if (mappedFeed && allFeeds[mappedFeed.feedId]) {
      return allFeeds[mappedFeed.feedId];
    }
    if (defaultFeed && allFeeds[defaultFeed]) {
      return allFeeds[defaultFeed];
    }
    return Object.values(allFeeds)[0];
  }, [allFeeds, defaultFeed, mappedFeed]);

  return (
    <StyledFeedComponent
      onMouseEnter={onOver}
      onMouseLeave={onLeave}
      onMouseOver={onOver}
      id={feed_id}
    >
      <FeedView feed={feed} />
      <FeedSelect id={feed_id} visible={isMouseOver} currentFeedId={feed.id} />
    </StyledFeedComponent>
  );
};

const FeedView: FC<{
  feed: FeedType;
}> = ({ feed }) => {
  switch (feed.type) {
    case FeedTypeEnum.Empty:
      return <EmptyFeed />;
    case FeedTypeEnum.NotSelected:
      return <TextFeed text="Nothing Selected" />;
    case FeedTypeEnum.Camera:
      return <CameraFeed feed={feed} />;
    case FeedTypeEnum.Urdf:
      return <UrdfFeed feed={feed} />;
    case FeedTypeEnum.Graph:
      return <GraphFeed feed={feed} />;
    case FeedTypeEnum.Pedro:
      return <PedroFeed />;
    default:
      return <TextFeed text="NOT SUPPORTED" />;
  }
};

const getLabel = (feed: FeedType) => {
  switch (feed.type) {
    case FeedTypeEnum.Camera:
      return feed.camera.name;
    case FeedTypeEnum.Graph:
      return feed.graph.name;
    default:
      return feed.id;
  }
};

const FeedSelect: FC<{
  id: string;
  visible: boolean;
  currentFeedId: string;
}> = ({ id, visible, currentFeedId }) => {
  const dispatch = useDispatch();
  const allFeeds = useSelector(selectAllFeeds);
  const feedCollection = Object.values(allFeeds);

  const selectFeed = (e: ChangeEvent<HTMLSelectElement>) => {
    dispatch(feedSlice.actions.updateFeedMap({ id, feedId: e.target.value }));
  };

  return (
    <StyledSelectContainer hidden={!visible}>
      <Select
        onChange={selectFeed}
        value={currentFeedId}
        options={feedCollection.map((feed) => ({
          key: feed.id,
          value: feed.id,
          content: getLabel(feed),
        }))}
      />
    </StyledSelectContainer>
  );
};

const StyledFeedComponent = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 1px;
`;

const StyledSelectContainer = styled.div`
  position: absolute;
  bottom: 4px;
  right: 4px;
`;
