import { createSlice } from "@reduxjs/toolkit";

interface UserState {
    user: {
        sub: string,
        role: string,
        iat: number,
        exp: number
    } | null,
    token: string | null
}

const initialState: UserState = {
    user: null,
    token: localStorage.getItem("jwt") || null
}

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            localStorage.setItem("jwt", action.payload.token);  // store token in localStorage
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem("jwt");  // remove token from localStorage
        }
    }
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;

