// redux toolkit store
import {
  configureStore,
  createListenerMiddleware,
} from "@reduxjs/toolkit/react";
import { useDispatch, useSelector } from "react-redux";
import rootReducer from "./rootReducers";

const listenerMiddlewareInstance = createListenerMiddleware({
  onError: () => console.error,
});

const store = configureStore({
  reducer: rootReducer,
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddlewareInstance.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootStateType = ReturnType<typeof store.getState>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootStateType) => T) =>
  useSelector<RootStateType, T>(selector);

export default store;
