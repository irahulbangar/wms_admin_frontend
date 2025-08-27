import { combineReducers } from "@reduxjs/toolkit";
import adminReducer from "./adminSlice";
import organizationReducer from "./organizationSlice";
import projectReducer from "./projectSlice";
import clientReducer from "./clientSlice";
import deviceReducer from "./deviceSlice";

const rootReducer = combineReducers({
  admin: adminReducer,
  organization: organizationReducer,
  project: projectReducer,
  client: clientReducer,
  device: deviceReducer,
});

export default rootReducer;
