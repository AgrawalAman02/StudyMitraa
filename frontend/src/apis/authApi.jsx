import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import { addLoggedInUser } from '@/store/authSlice';
const SERVER_URL = import.meta.env.VITE_SERVER_URL;


export const authApi  = createApi({
    reducerPath : "authApi",
    baseQuery : fetchBaseQuery({
        baseUrl : SERVER_URL+"/user/",
        credentials : "include",
    }),

    endpoints : (builder) =>({
        registerUser : builder.mutation({
            query : (inputData)=>({
                url : "signup",
                method : "POST",
                body: inputData
            }),
        }),

        loginUser : builder.mutation({
            query : (inputData)=>({
                url : "login",
                method : "POST",
                body: inputData
            }),
            async onQueryStarted(_,{queryFulfilled,dispatch}){
                try {
                    const result = await queryFulfilled;
                    dispatch(addLoggedInUser({ user: result.data}))
                } catch (error) {
                    console.log(error);
                }
            }
        }),
    })

});

export const  {useLoginUserMutation, useRegisterUserMutation} = authApi;
