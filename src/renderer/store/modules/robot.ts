import { GlobalState } from '@/renderer/store/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Robot{
    name: string;
}

export const initialState: Robot ={
    name:'rove',
};

export const robotSlice = createSlice({
    name:'robotChoice',
    initialState,
    reducers:{
        toggleRobot: (state, { payload }: PayloadAction<string>)=>{
            state.name = payload;
        }
    }
});
export const selectRobot =(state: GlobalState) => state.robot.name;

