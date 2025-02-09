import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

const appStore = configureStore({
    reducer : rootReducer,
    // middleware : (d)=>d().concat(authApi.middleware),
    
})

export default appStore;
