// redux toolkit store
import {
  configureStore,
  createListenerMiddleware,
} from "@reduxjs/toolkit/react";
import { useDispatch, useSelector } from "react-redux";
import rootReducer from "./rootReducers";
import { organizationApi, plantApi } from "./rtkQuery";

const listenerMiddlewareInstance = createListenerMiddleware({
  onError: () => console.error,
});

// Initialize store with authentication state from localStorage
const getInitialState = () => {
  try {
    const token = localStorage.getItem("accessToken");
    const admin = localStorage.getItem("admin");

    if (token && admin) {
      const adminData = JSON.parse(admin);
      return {
        admin: {
          admin: adminData,
          token: token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      };
    }
  } catch (error) {
    console.error("Error restoring auth state:", error);
    localStorage.clear();
  }

  return {};
};

const store = configureStore({
  reducer: rootReducer,
  preloadedState: getInitialState(),
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(listenerMiddlewareInstance.middleware)
      .concat(organizationApi.middleware)
      .concat(plantApi.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootStateType = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootStateType) => T) =>
  useSelector<RootStateType, T>(selector);

export default store;
