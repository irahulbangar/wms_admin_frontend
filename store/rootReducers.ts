import { combineReducers } from "@reduxjs/toolkit";
import adminReducer from "./adminSlice";
import organizationReducer from "./organizationSlice";

const rootReducer = combineReducers({
  admin: adminReducer,
  organization: organizationReducer,
});

export default rootReducer;
