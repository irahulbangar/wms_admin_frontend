import { combineReducers } from "@reduxjs/toolkit";
import adminReducer from "./adminSlice";
import organizationReducer from "./organizationSlice";
import plantReducer from "./plantSlice";
import clientReducer from "./clientSlice";
import deviceReducer from "./deviceSlice";
import userPlantReducer from "./userPlantSlice";
import departmentReducer from "./departmentSlice";
import systemReducer from "./systemSlice";
import { organizationApi, plantApi, departmentApi, systemApi, deviceApi } from "./rtkQuery";

const rootReducer = combineReducers({
  admin: adminReducer,
  organization: organizationReducer,
  plant: plantReducer,
  client: clientReducer,
  device: deviceReducer,
  userPlant: userPlantReducer,
  department: departmentReducer,
  system: systemReducer,
  [organizationApi.reducerPath]: organizationApi.reducer,
  [plantApi.reducerPath]: plantApi.reducer,
  [departmentApi.reducerPath]: departmentApi.reducer,
  [systemApi.reducerPath]: systemApi.reducer,
  [deviceApi.reducerPath]: deviceApi.reducer,
});

export default rootReducer;
