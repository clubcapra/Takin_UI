import {
  clearStoreCache,
  loadState,
  saveState,
} from '@/renderer/store/localStorage';
import { feedSlice } from '@/renderer/store/modules/feed';
import { inputSlice } from '@/renderer/store/modules/input';
import { rosSlice } from '@/renderer/store/modules/ros';
import { debugTabSlice } from '@/renderer/store/modules/debugTab';
import { configureStore, AnyAction, combineReducers } from '@reduxjs/toolkit';
import { throttle } from 'lodash';
import { launchFilesSlice } from './modules/launchFiles';
import { armPresetsSlice } from './modules/armPresets';
import { gpioPinsSlice } from './modules/gpioPins';
import { robotSlice } from './modules/robot';

const appReducer = combineReducers({
  feed: feedSlice.reducer,
  ros: rosSlice.reducer,
  input: inputSlice.reducer,
  debugTab: debugTabSlice.reducer,
  launchFiles: launchFilesSlice.reducer,
  armPresets: armPresetsSlice.reducer,
  gpioPins: gpioPinsSlice.reducer,
  robot: robotSlice.reducer,
});

export type GlobalState = ReturnType<typeof appReducer>;

export const RESET_STATE = { type: 'RESET_STATE' };

export const rootReducer = (
  state: GlobalState | undefined,
  action: AnyAction
) => {
  if (action.type === RESET_STATE.type) {
    state = undefined;
    clearStoreCache();
  }

  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadState(),
});

store.subscribe(
  throttle(() => {
    saveState(store.getState());
  }, 2000)
);
