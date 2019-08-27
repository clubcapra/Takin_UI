import { ICameraData } from './@types'
import { PayloadAction, createSlice } from 'redux-starter-kit'
import { FeedTypeEnum } from 'store/modules/feed/@types'
import { initialState } from 'store/modules/feed/initialState'
import shortid from 'shortid'
import { GlobalState } from 'store/rootReducer'

export const feedSlice = createSlice({
  initialState,
  reducers: {
    addCamera: (state, { payload }: PayloadAction<ICameraData>) => {
      const id = shortid()
      state.feeds[id] = {
        id,
        type: FeedTypeEnum.camera,
        camera: payload,
      }
    },
    removeFeed: (state, { payload }: PayloadAction<string>) => {
      delete state.feeds[payload]

      Object.values(state.feedMap).some(m => {
        if (m.feedId === payload) {
          delete state.feedMap[m.id]
          return true
        }
        return false
      })
    },
    changeCamera: (
      state,
      {
        payload: { camera, id },
      }: PayloadAction<{ camera: ICameraData; id: string }>
    ) => {
      const feed = state.feeds[id]

      if (feed.type !== FeedTypeEnum.camera) return
      feed.camera = camera
    },
    updateFeedMap: (
      state,
      { payload: { id, feedId } }: PayloadAction<{ id: string; feedId: string }>
    ) => {
      state.feedMap[id] = { id, feedId }
    },
  },
})

export const selectAllFeeds = (state: GlobalState) => state.feed.feeds
export const selectFeedFromFeedMap = (id: string) => (state: GlobalState) =>
  state.feed.feedMap[id]
