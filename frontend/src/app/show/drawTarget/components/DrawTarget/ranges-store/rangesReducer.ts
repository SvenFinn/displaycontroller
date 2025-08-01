import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Range } from "@shared/ranges"

export const rangesSlice = createSlice({
    name: 'ranges',
    initialState: [] as Array<Range | null>,
    reducers: {
        setRange(state, action: PayloadAction<Range>) {
            state[action.payload.id] = action.payload;
        },
    }
});

export const { setRange } = rangesSlice.actions;

export const rangesReducer = rangesSlice.reducer;
