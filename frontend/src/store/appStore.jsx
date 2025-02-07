import { configureStore } from "@reduxjs/toolkit";

const appStore = configureStore({
    reducer : rootReducer,
    middleware : (d)=>d().concat(authApi.middleware),
    
})

export default appStore;
