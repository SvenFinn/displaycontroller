import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Range } from "dc-ranges-types"

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
