import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    button: "off",
    userData: null,
    option: "100",
    emoji: null,
    img: null,
    smollSize: 0,
    chatStatas: true,
    status: false,
    callerId: null
}

export const CounterSlice = createSlice({

    name: "count",
    initialState,
    reducers: {
        on: (state) => {
            state.button = "on"
        },
        off: (state) => {
            state.button = "off"
        },
        getUser: (state, action) => {
            state.userData = action.payload;
        },
        closegetUser: (state, action) => {
            state.userData = null;
        },

        closeOption: (state, action) => {
            state.option = "2151";
        },
        startOption: (state, action) => {
            state.option = action.payload;
        },

        emojiFalse: (state, action) => {
            state.emoji = false
        },
        emojiTrue: (state, action) => {
            state.emoji = true
        },

        imgFalse: (state, action) => {
            state.img = false
        },
        imgTrue: (state, action) => {
            state.img = true
        },

        ZindexOne: (state, action) => {
            state.smollSize = -1
        },
        ZindexMinasOne: (state, action) => {
            state.smollSize = -1
        },

        closeChat: (state, action) => {
            state.chatStatas = false
        },
        OnChat: (state, action) => {
            state.chatStatas = true
        },

        statusOn: (state, action) => {
            state.status = true
        },
        statusOff: (state, action) => {
            state.status = false
        },
        callerUser: (state, action) => {
            state.callerId = action.payload
        },
        callerUserEmpty: (state, action) => {
            state.callerId = null
        }
    }

})


export const { on, off, getUser, closeOption, startOption, emojiFalse, emojiTrue, imgFalse, imgTrue, ZindexOne, ZindexMinasOne, closeChat, OnChat, closegetUser, statusOn, statusOff, callerUser, callerUserEmpty } = CounterSlice.actions;

export default CounterSlice.reducer;