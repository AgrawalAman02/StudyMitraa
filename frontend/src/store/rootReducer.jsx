import { combineReducers } from "@reduxjs/toolkit";
import { authApi } from "@/apis/authApi";   
import authReducer from "./authSlice.jsx"
import userActivityReducer from "./userActivitySlice";



const rootReducer = combineReducers({
    [authApi.reducerPath]:authApi.reducer,
    auth:authReducer,
    userActivity: userActivityReducer
});

export default rootReducer;
