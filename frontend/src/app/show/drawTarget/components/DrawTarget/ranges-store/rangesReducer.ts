import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Range } from "dc-ranges-types"

type RangeWithHistory = Range & {
    hasBeenFree: boolean;
}

export const rangesSlice = createSlice({
    name: 'ranges',
    initialState: {} as Record<number, RangeWithHistory>,
    reducers: {
        setRange(state, action: PayloadAction<Range>) {
            const range = state[action.payload.id];
            state[action.payload.id] = {
                ...action.payload,
                hasBeenFree: range?.hasBeenFree || !action.payload.active || !action.payload.shooter
            };
        },
    }
});

export const { setRange } = rangesSlice.actions;

export const rangesReducer = rangesSlice.reducer;
