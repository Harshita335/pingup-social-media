import { ALL_MESSAGES_ADD, ALL_MESSAGES_FAIL, ALL_MESSAGES_REQUEST, ALL_MESSAGES_SUCCESS, CLEAR_ERRORS, NEW_MESSAGE_FAIL, NEW_MESSAGE_REQUEST, NEW_MESSAGE_RESET, NEW_MESSAGE_SUCCESS } from "../constants/messageConstants";
import { MESSAGE_UPDATED, MESSAGE_DELETED, MESSAGE_REACTIONS } from "../constants/messageConstants";

export const allMessagesReducer = (state = { messages: [] }, { type, payload }) => {
    switch (type) {
        case ALL_MESSAGES_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case ALL_MESSAGES_SUCCESS:
            return {
                loading: false,
                messages: payload,
            };
        case ALL_MESSAGES_FAIL:
            return {
                ...state,
                loading: false,
                error: payload,
            };
        case ALL_MESSAGES_ADD:
            return {
                ...state,
                messages: [...state.messages, payload]
            };
        case MESSAGE_UPDATED:
            return { ...state, messages: state.messages.map(m => m._id === payload._id ? payload : m) };
        case MESSAGE_DELETED:
            // payload may contain unsent:true or deletedFor user id
            if (payload.unsent) return { ...state, messages: state.messages.map(m => m._id === payload.id ? { ...m, unsent: true, content: '' } : m) };
            // local deletion - remove message for current user by filtering on id? backend filters on fetch; here we'll mark deletedFor
            return { ...state, messages: state.messages.filter(m => m._id !== payload.id && (!payload.deletedFor || payload.deletedFor !== undefined)) };
        case MESSAGE_REACTIONS:
            return { ...state, messages: state.messages.map(m => m._id === payload.id ? { ...m, reactions: payload.reactions } : m) };
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
}

export const newMessageReducer = (state = {}, { type, payload }) => {
    switch (type) {
        case NEW_MESSAGE_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case NEW_MESSAGE_SUCCESS:
            return {
                loading: false,
                success: payload.success,
                newMessage: payload.newMessage,
            };
        case NEW_MESSAGE_RESET:
            return {
                ...state,
                success: false,
                newMessage: {}
            };
        case NEW_MESSAGE_FAIL:
            return {
                ...state,
                loading: false,
                error: payload,
            };
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
}