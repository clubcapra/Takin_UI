import { GlobalState } from '@/renderer/store/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TopicOptions } from '@/renderer/utils/ros/roslib-ts-client/@types';
import { nanoid } from 'nanoid';

export interface FeedState {
  feeds: { [feedId: string]: FeedType };
  feedMap: {
    [id: string]: {
      id: string;
      feedId: string;
    };
  };

  feed_front: string;
  feed_back: string;
}

export enum FeedTypeEnum {
  Empty,
  Camera,
  Urdf,
  Graph,
  Pedro,
  NotSelected,
}

export enum CameraType {
  COMPRESSED = 'ros_compressed',
  MJPEG = 'mjpeg',
  PNG = 'png',
  VP8 = 'vp8',
  WEBCAM = 'webcam',
  QR_CODE = 'qr_code',
  RTSP = 'rtsp',
}

export type FeedType =
  | IEmptyFeed
  | ICameraFeed
  | IUrdfFeed
  | IGraphFeed
  | IPedroFeed
  | INotSelected;

interface BaseFeed {
  type: FeedTypeEnum;
  id: string;
}

export interface IEmptyFeed extends BaseFeed {
  type: FeedTypeEnum.Empty;
}

export interface INotSelected extends BaseFeed {
  type: FeedTypeEnum.NotSelected;
}

export interface ICameraFeed extends BaseFeed {
  type: FeedTypeEnum.Camera;
  camera: ICameraData;
}

export interface ICameraData {
  name: string;
  type: CameraType;
  topic: string;
  flipped: boolean;
  rotated: boolean;
}

export interface IUrdfFeed extends BaseFeed {
  type: FeedTypeEnum.Urdf;
}

export interface IGraphFeed extends BaseFeed {
  type: FeedTypeEnum.Graph;
  graph: IGraphData;
}

export interface IGraphData {
  topic: TopicOptions<string>;
  name: string;
}

export interface IPedroFeed extends BaseFeed {
  type: FeedTypeEnum.Pedro;
  name: string;
}

export const feed_id = {
  teleop: {
    main: 'teleop_main',
    bottom_left: 'teleop_bottom_left',
    top_left: 'teleop_top_left',
    top_right: 'teleop_top_right',
  },
  victim: {},
};

export const initialState: FeedState = {
  feedMap: {},
  feed_front: feed_id.teleop.main,
  feed_back: feed_id.teleop.bottom_left,
  feeds: {
    empty: {
      type: FeedTypeEnum.Empty,
      id: 'empty',
    },
    not_selected: {
      type: FeedTypeEnum.NotSelected,
      id: 'not_selected',
    },
    camera00: {
      type: FeedTypeEnum.Camera,
      id: 'camera00',
      camera: {
        name: 'camera00',
        type: CameraType.COMPRESSED,
        topic: '/markhor/camera_00/usb_cam/image_raw',
        flipped: true,
        rotated: true,
      },
    },
    camera01: {
      type: FeedTypeEnum.Camera,
      id: 'camera01',
      camera: {
        name: 'camera01',
        type: CameraType.COMPRESSED,
        topic: '/markhor/camera_01/usb_cam/image_raw',
        flipped: true,
        rotated: false,
      },
    },
    camera02: {
      type: FeedTypeEnum.Camera,
      id: 'camera02',
      camera: {
        name: 'camera02',
        type: CameraType.COMPRESSED,
        topic: '/markhor/camera_02/usb_cam/image_raw',
        flipped: true,
        rotated: false,
      },
    },
    hazmat: {
      type: FeedTypeEnum.Camera,
      id: 'hazmat',
      camera: {
        name: 'hazmat',
        type: CameraType.COMPRESSED,
        topic: '/capra/hazmat_detection/detection_view',
        flipped: true,
        rotated: true,
      },
    },
    webcam: {
      type: FeedTypeEnum.Camera,
      id: 'webcam',
      camera: {
        name: 'webcam',
        type: CameraType.WEBCAM,
        topic: '',
        flipped: false,
        rotated: false,
      },
    },
    urdf_viewer: {
      type: FeedTypeEnum.Urdf,
      id: 'urdf_viewer',
    },
    magnet_graph: {
      type: FeedTypeEnum.Graph,
      id: 'magnet_graph',
      graph: {
        name: 'magnet_graph',
        topic: {
          name: '/magnet_polarity',
          messageType: 'std_msgs/Float64',
        },
      },
    },
    thermal: {
      type: FeedTypeEnum.Camera,
      id: 'thermal',
      camera: {
        name: 'thermal',
        type: CameraType.COMPRESSED,
        topic: '/capra_thermal_cam/image_raw',
        flipped: true,
        rotated: false,
      },
    },
    qr_code: {
      type: FeedTypeEnum.Camera,
      id: 'qr_code',
      camera: {
        name: 'qr_code',
        type: CameraType.QR_CODE,
        topic: '/markhor/camera_00/usb_cam/image_raw',
        flipped: true,
        rotated: false,
      },
    },
    pedro: {
      type: FeedTypeEnum.Pedro,
      id: 'pedro',
      name: 'pedro'
    }
  },
};

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    addCamera: (state, { payload }: PayloadAction<ICameraData>) => {
      const id = nanoid();
      state.feeds[id] = {
        id,
        type: FeedTypeEnum.Camera,
        camera: payload,
      };
    },
    addGraph: (state, { payload }: PayloadAction<IGraphData>) => {
      const id = nanoid();
      state.feeds[id] = {
        id,
        type: FeedTypeEnum.Graph,
        graph: payload,
      };
    },
    removeFeed: (state, { payload }: PayloadAction<string>) => {
      delete state.feeds[payload];

      Object.values(state.feedMap).some((m) => {
        if (m.feedId === payload) {
          delete state.feedMap[m.id];
          return true;
        }
        return false;
      });
    },
    updateCamera: (
      state,
      {
        payload: { camera, id },
      }: PayloadAction<{ camera: ICameraData; id: string }>
    ) => {
      const feed = state.feeds[id];
      if (feed.type !== FeedTypeEnum.Camera) {
        return;
      }
      feed.camera = camera;
    },
    updateGraph: (
      state,
      {
        payload: { graph, id },
      }: PayloadAction<{ graph: IGraphData; id: string }>
    ) => {
      const feed = state.feeds[id];
      if (feed.type !== FeedTypeEnum.Graph) {
        return;
      }
      feed.graph = graph;
    },
    updateFeedMap: (
      state,
      { payload: { id, feedId } }: PayloadAction<{ id: string; feedId: string }>
    ) => {
      state.feedMap[id] = { id, feedId };
    },
    switchDirection: (state) => {
      const feed_id_old = state.feedMap[state.feed_front];
      state.feedMap[state.feed_front] = state.feedMap[state.feed_back];
      state.feedMap[state.feed_back] = feed_id_old;
    },
  },
});

export const selectAllFeeds = (state: GlobalState) => state.feed.feeds;

export const selectFeedFromFeedMap = (id: string) => (state: GlobalState) =>
  state.feed.feedMap[id];

export const selectAllCamera = (state: GlobalState) =>
  Object.values(state.feed.feeds)
    .filter((feed) => feed.type === FeedTypeEnum.Camera)
    .reverse() as ICameraFeed[];

export const selectAllGraph = (state: GlobalState) =>
  Object.values(state.feed.feeds)
    .filter((feed) => feed.type === FeedTypeEnum.Graph)
    .reverse() as IGraphFeed[];
