import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ScreenAvailable, Screen } from 'dc-screens-types';

export const screensSlice = createSlice({
    name: 'screens',
    initialState: [null, null] as Array<ScreenAvailable | null>,
    reducers: {
        nextScreen(state, action: PayloadAction<Screen>) {
            if (!action.payload.available) {
                state[0] = null;
                state[1] = null;
                return;
            }
            const stateStrings = state.map((s) => JSON.stringify(s));
            if (stateStrings.includes(JSON.stringify(action.payload))) {
                return;
            }
            if (state[0] === null) {
                state[0] = action.payload;
            } else {
                state[1] = action.payload
            }
        },
        screenReady(state, action: PayloadAction<number>) {
            if (action.payload === 1) {
                state[0] = null;
            }
            if (action.payload === 0) {
                state[1] = null;
            }
        }
    }
});

export const { nextScreen, screenReady } = screensSlice.actions;

export const screensReducer = screensSlice.reducer;
