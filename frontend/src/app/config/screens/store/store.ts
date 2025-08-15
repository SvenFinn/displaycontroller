import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { screensReducer } from './screensReducer'


export const store = configureStore({
    reducer: {
        screens: screensReducer
    }
})

// Get the type of our store variable
export type AppStore = typeof store
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = AppStore['dispatch']

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

export const useAppSelector = <TSelected>(
    selector: (state: RootState) => TSelected
) => useSelector.withTypes<RootState>()(selector, (state, next) => {
    return JSON.stringify(state) === JSON.stringify(next);
});
export const useAppStore = useStore.withTypes<AppStore>()