import { createSlice } from "@reduxjs/toolkit";

const userActivitySlice = createSlice({ 
    name: "userActivity", 
    initialState: { isIdle: false }, 
    reducers: { 
        setIsIdle: (state, action) => { 
            state.isIdle = action.payload; 
        } 
    } 
});

export const { setIsIdle } = userActivitySlice.actions; 
export default userActivitySlice.reducer;