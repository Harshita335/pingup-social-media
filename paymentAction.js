import axios from '../axiosConfig';
import {
    WALLET_REQUEST, WALLET_SUCCESS, WALLET_FAIL,
    TOPUP_REQUEST, TOPUP_SUCCESS, TOPUP_FAIL,
    TRANSFER_REQUEST, TRANSFER_SUCCESS, TRANSFER_FAIL,
    TRANSACTIONS_REQUEST, TRANSACTIONS_SUCCESS, TRANSACTIONS_FAIL
} from '../constants/paymentConstants';

export const getWallet = () => async (dispatch) => {
    try {
        dispatch({ type: WALLET_REQUEST });
        const { data } = await axios.get('/api/v1/payments/wallet');
        dispatch({ type: WALLET_SUCCESS, payload: data.wallet });
    } catch (error) {
        dispatch({ type: WALLET_FAIL, payload: error.response?.data?.message || error.message });
    }
}

export const topUp = (amount, method = 'bank') => async (dispatch) => {
    try {
        dispatch({ type: TOPUP_REQUEST });
        const config = { headers: { 'Content-Type': 'application/json' } };
        const { data } = await axios.post('/api/v1/payments/wallet/topup', { amount, method }, config);
        dispatch({ type: TOPUP_SUCCESS, payload: data.wallet });
        // refresh wallet
        dispatch(getWallet());
        return data;
    } catch (error) {
        dispatch({ type: TOPUP_FAIL, payload: error.response?.data?.message || error.message });
        throw error;
    }
}

export const transferToUser = (payload) => async (dispatch) => {
    try {
        const { toUserId, toUsername, amount, method = 'wallet', senderMethodId, pin } = payload || {};
        dispatch({ type: TRANSFER_REQUEST });
        const config = { headers: { 'Content-Type': 'application/json' } };
        const body = { amount, method };
        if (toUserId) body.toUserId = toUserId;
        if (toUsername) body.toUsername = toUsername;
        if (senderMethodId) body.senderMethodId = senderMethodId;
        if (pin) body.pin = pin;
        const { data } = await axios.post('/api/v1/payments/transfer', body, config);
        dispatch({ type: TRANSFER_SUCCESS, payload: data.transaction });
        dispatch(getWallet());
        return data;
    } catch (error) {
        dispatch({ type: TRANSFER_FAIL, payload: error.response?.data?.message || error.message });
        throw error;
    }
}

export const getTransactions = () => async (dispatch) => {
    try {
        dispatch({ type: TRANSACTIONS_REQUEST });
        const { data } = await axios.get('/api/v1/payments/transactions');
        dispatch({ type: TRANSACTIONS_SUCCESS, payload: data.transactions });
    } catch (error) {
        dispatch({ type: TRANSACTIONS_FAIL, payload: error.response?.data?.message || error.message });
    }
}
