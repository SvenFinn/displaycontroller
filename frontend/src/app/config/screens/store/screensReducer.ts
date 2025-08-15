import { getHost } from '@frontend/app/hooks/useHost';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DbScreen, isDbScreen } from 'dc-screens-types';
import { RootState } from './store';
import { getDefaultOptions } from './default';

export const fetchScreens = createAsyncThunk("screens/fetchScreens", async () => {
    const host = getHost();
    if (!host) {
        throw new Error("Host is not defined");
    }
    const response = await fetch(`${host}/api/screens`);
    if (!response.ok) {
        throw new Error(`Failed to fetch screens: ${response.statusText}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
        throw new Error("Invalid screens response");
    }
    for (const screen of data) {
        if (!isDbScreen(screen)) {
            throw new Error("Invalid screen format");
        }
    }
    // Ensure the screens are sorted by id
    data.sort((a, b) => a.id - b.id);
    return data as DbScreen[];
});

export const createScreen = createAsyncThunk("screens/createScreen", async (type: DbScreen["type"], { dispatch }) => {
    const screen = getDefaultOptions({
        id: 0, // This will be set by the server
        type,
        visibleFrom: null,
        visibleUntil: null,
        conditions: null,
        options: {},
        duration: 30000
    });
    const host = getHost();
    if (!host) {
        throw new Error("Host is not defined");
    }
    const response = await fetch(`${host}/api/screens`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(screen)
    });
    if (!response.ok) {
        throw new Error(`Failed to create screen: ${response.statusText}`);
    }
    const newScreen = await response.json();
    if (!isDbScreen(newScreen)) {
        throw new Error("Invalid screen format");
    }

    await dispatch(fetchScreens());

    dispatch(selectScreen(newScreen.id));
});

export const deleteScreen = createAsyncThunk("screens/deleteScreen", async (screenId: number, { dispatch, getState }) => {
    const host = getHost();
    const state = getState() as RootState;

    if (!host) {
        throw new Error("Host is not defined");
    }
    const response = await fetch(`${host}/api/screens/${screenId}`, {
        method: "DELETE"
    });
    if (!response.ok) {
        console.error("Failed to delete screen", response.statusText);
        throw new Error(`Failed to delete screen: ${response.statusText}`);
    }

    if (state.screens.currentScreenId === screenId) {
        dispatch(selectScreen(1)); // Reset to the first screen
    }

    await dispatch(fetchScreens());
});

export const moveScreenUp = createAsyncThunk("screens/moveScreenUp", async (screenId: number, { dispatch, getState }) => {
    const host = getHost();
    const state = getState() as RootState;

    const newScreenId = screenId - 1;
    if (newScreenId < 1) {
        return; // Cannot move the first screen up
    }
    if (!host) {
        throw new Error("Host is not defined");
    }
    const response = await fetch(`${host}/api/screens/swap/${screenId}/${screenId - 1}`, {
        method: "PUT"
    });
    if (!response.ok) {
        throw new Error(`Failed to move screen up: ${response.statusText}`);
    }

    if (state.screens.currentScreenId === screenId) {
        dispatch(selectScreen(newScreenId));
    } else if (state.screens.currentScreenId === newScreenId) {
        dispatch(selectScreen(screenId));
    }

    await dispatch(fetchScreens());
});

export const moveScreenDown = createAsyncThunk("screens/moveScreenDown", async (screenId: number, { dispatch, getState }) => {
    const host = getHost();

    const state = getState() as RootState;
    const screens = state.screens.screens;
    if (screenId >= screens.length) {
        return; // Cannot move the last screen down
    }

    const newScreenId = screenId + 1;
    if (!host) {
        throw new Error("Host is not defined");
    }
    const response = await fetch(`${host}/api/screens/swap/${screenId}/${newScreenId}`, {
        method: "PUT"
    });
    if (!response.ok) {
        console.error("Failed to move screen down", response.statusText);
        throw new Error(`Failed to move screen down: ${response.statusText}`);
    }

    if (state.screens.currentScreenId === screenId) {
        dispatch(selectScreen(newScreenId));
    } else if (state.screens.currentScreenId === newScreenId) {
        dispatch(selectScreen(screenId));
    }
    await dispatch(fetchScreens());
});

export const updateScreen = createAsyncThunk("screens/updateScreen", async (screen: DbScreen, { dispatch }) => {
    const host = getHost();
    if (!host) {
        throw new Error("Host is not defined");
    }

    const response = await fetch(`${host}/api/screens/${screen.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(screen)
    });
    if (!response.ok) {
        throw new Error(`Failed to update screen: ${response.statusText}`);
    }
    await dispatch(fetchScreens());
});



export const screensSlice = createSlice({
    name: 'screens',
    initialState: {
        screens: [],
        currentScreenId: 1,
        loading: null,
        error: null,
    } as {
        screens: Array<DbScreen>,
        currentScreenId: number,
        loading: string | null,
        error: string | null
    },
    reducers: {
        selectScreen(state, action: PayloadAction<number>) {
            state.currentScreenId = action.payload;
        },
        clearError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchScreens.pending, (state) => {
                state.loading = "Loading screens...";
            })
            .addCase(fetchScreens.fulfilled, (state, action: PayloadAction<DbScreen[]>) => {
                state.screens = action.payload;
                state.loading = null;
            })
            .addCase(fetchScreens.rejected, (state, action) => {
                state.error = `Failed to load screens: ${action.error.message}`;
                state.loading = null;
            })
            .addCase(createScreen.pending, (state) => {
                state.loading = "Creating screen...";
            })
            .addCase(createScreen.fulfilled, (state) => {
                state.loading = null;
            })
            .addCase(createScreen.rejected, (state, action) => {
                state.error = `Failed to create screen: ${action.error.message}`;
                state.loading = null;
            })
            .addCase(deleteScreen.pending, (state) => {
                state.loading = "Deleting screen...";
            })
            .addCase(deleteScreen.fulfilled, (state) => {
                state.loading = null;
            })
            .addCase(deleteScreen.rejected, (state, action) => {
                state.error = `Failed to delete screen: ${action.error.message}`;
                state.loading = null;
            })
            .addCase(moveScreenUp.pending, (state) => {
                state.loading = "Moving screen up...";
            })
            .addCase(moveScreenUp.fulfilled, (state) => {
                state.loading = null;
            })
            .addCase(moveScreenUp.rejected, (state, action) => {
                state.error = `Failed to move screen up: ${action.error.message}`;
                state.loading = null;
            })
            .addCase(moveScreenDown.pending, (state) => {
                state.loading = "Moving screen down...";
            })
            .addCase(moveScreenDown.fulfilled, (state) => {
                state.loading = null;
            })
            .addCase(moveScreenDown.rejected, (state, action) => {
                state.error = `Failed to move screen down: ${action.error.message}`;
                state.loading = null;
            })
            .addCase(updateScreen.pending, (state) => {
                state.loading = "Updating screen...";
            })
            .addCase(updateScreen.fulfilled, (state) => {
                state.loading = null;
            })
            .addCase(updateScreen.rejected, (state, action) => {
                state.error = `Failed to update screen: ${action.error.message}`;
                state.loading = null;
            });
    }
});


export const screensReducer = screensSlice.reducer;

export const { selectScreen, clearError } = screensSlice.actions;
