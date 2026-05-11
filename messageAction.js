import axios from "axios";
import { ALL_MESSAGES_FAIL, ALL_MESSAGES_REQUEST, ALL_MESSAGES_SUCCESS, CLEAR_ERRORS, NEW_MESSAGE_FAIL, NEW_MESSAGE_REQUEST, NEW_MESSAGE_SUCCESS } from "../constants/messageConstants";
import { MESSAGE_UPDATED, MESSAGE_DELETED, MESSAGE_REACTIONS } from "../constants/messageConstants";

// Get All Messages
export const getAllMessages = (chatId) => async (dispatch) => {
    try {

        dispatch({ type: ALL_MESSAGES_REQUEST });

        const { data } = await axios.get(`/api/v1/messages/${chatId}`);

        dispatch({
            type: ALL_MESSAGES_SUCCESS,
            payload: data.messages,
        });

    } catch (error) {
        dispatch({
            type: ALL_MESSAGES_FAIL,
            payload: error.response.data.message,
        });
    }
};

// New Message
export const sendMessage = (msgData) => async (dispatch) => {
    try {

        dispatch({ type: NEW_MESSAGE_REQUEST });
        const config = { header: { "Content-Type": "application/json" } }
        const { data } = await axios.post('/api/v1/newMessage/', msgData, config);

        dispatch({
            type: NEW_MESSAGE_SUCCESS,
            payload: data,
        });

    } catch (error) {
        dispatch({
            type: NEW_MESSAGE_FAIL,
            payload: error.response.data.message,
        });
    }
}

// Clear All Errors
export const clearErrors = () => (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
}

export const editMessage = (id, content) => async (dispatch) => {
    try {
        const config = { headers: { 'Content-Type': 'application/json' } };
        const { data } = await axios.put(`/api/v1/message/${id}`, { content }, config);
        dispatch({ type: MESSAGE_UPDATED, payload: data.message });
        return data;
    } catch (e) { throw e; }
}

export const deleteMessage = (id, unsend = false) => async (dispatch) => {
    try {
        const { data } = await axios.delete(`/api/v1/message/${id}${unsend ? '?unsend=true' : ''}`);
        dispatch({ type: MESSAGE_DELETED, payload: unsend ? { id, unsent: true } : { id } });
        return data;
    } catch (e) { throw e; }
}

export const toggleReaction = (id, emoji) => async (dispatch) => {
    try {
        const config = { headers: { 'Content-Type': 'application/json' } };
        const { data } = await axios.post(`/api/v1/message/${id}/reaction`, { emoji }, config);
        dispatch({ type: MESSAGE_REACTIONS, payload: { id, reactions: data.reactions } });
        return data;
    } catch (e) { throw e; }
}