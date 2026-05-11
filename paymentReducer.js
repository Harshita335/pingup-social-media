import {
    WALLET_REQUEST, WALLET_SUCCESS, WALLET_FAIL,
    TOPUP_REQUEST, TOPUP_SUCCESS, TOPUP_FAIL,
    TRANSFER_REQUEST, TRANSFER_SUCCESS, TRANSFER_FAIL,
    TRANSACTIONS_REQUEST, TRANSACTIONS_SUCCESS, TRANSACTIONS_FAIL
} from '../constants/paymentConstants';

const initialState = {
    wallet: null,
    loading: false,
    transactions: [],
    error: null,
};

export const paymentReducer = (state = initialState, action) => {
    switch (action.type) {
        case WALLET_REQUEST:
        case TOPUP_REQUEST:
        case TRANSFER_REQUEST:
        case TRANSACTIONS_REQUEST:
            return { ...state, loading: true, error: null };
        case WALLET_SUCCESS:
            return { ...state, loading: false, wallet: action.payload };
        case TOPUP_SUCCESS:
            return { ...state, loading: false, wallet: action.payload };
        case TRANSFER_SUCCESS:
            return { ...state, loading: false };
        case TRANSACTIONS_SUCCESS:
            return { ...state, loading: false, transactions: action.payload };
        case WALLET_FAIL:
        case TOPUP_FAIL:
        case TRANSFER_FAIL:
        case TRANSACTIONS_FAIL:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}
