import { combineReducers } from "@reduxjs/toolkit";
import adminReducer from "./adminSlice";
import organizationReducer from "./organizationSlice";
import projectReducer from "./projectSlice";

const rootReducer = combineReducers({
  admin: adminReducer,
  organization: organizationReducer,
  project: projectReducer,
});

export default rootReducer;
