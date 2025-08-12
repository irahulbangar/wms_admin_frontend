import { combineReducers } from "@reduxjs/toolkit";
import adminReducer from "./adminSlice";

const rootReducer = combineReducers({
  admin: adminReducer,
});

export default rootReducer;
