import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getWallet, topUp, transferToUser, getTransactions } from '../../actions/paymentAction'
import axios from 'axios'
import { paymentIcon } from '../Navbar/SvgIcons'

const Wallet = () => {
    const dispatch = useDispatch();
    const { wallet, loading, transactions, error } = useSelector(state => state.payment || {});
    const { user } = useSelector(state => state.user);

    const [topAmount, setTopAmount] = useState('');
    const [topMethod, setTopMethod] = useState('bank');
    const [methods, setMethods] = useState([]);
    const [newMethodType, setNewMethodType] = useState('bank');
    const [newAccountNumber, setNewAccountNumber] = useState('');
    const [newIfsc, setNewIfsc] = useState('');
    const [newUpiId, setNewUpiId] = useState('');
    const [sendAmount, setSendAmount] = useState('');
    const [sendTo, setSendTo] = useState('');
    const [recipients, setRecipients] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState('');
    const [selectedSenderMethod, setSelectedSenderMethod] = useState('');
    const [pin, setPin] = useState('');
    const [hasPin, setHasPin] = useState(false);

    useEffect(() => {
        dispatch(getWallet());
        dispatch(getTransactions());
        fetchMethods();
        fetchRecipients();
        fetchPinStatus();
    }, [dispatch]);

    const fetchMethods = async () => {
        try {
            const { data } = await axios.get('/api/v1/payments/methods', { withCredentials: true });
            if (data && data.methods) setMethods(data.methods);
        } catch (e) { console.debug('methods fetch', e && e.message ? e.message : e); }
    }

    const handleTopUp = async (e) => {
        e.preventDefault();
        try {
            await dispatch(topUp(Number(topAmount), topMethod));
            setTopAmount('');
            alert('Top-up successful');
        } catch (e) {
            alert('Top-up failed: ' + (e.response?.data?.message || e.message));
        }
    }

    const handleSend = async (e) => {
        e.preventDefault();
        try {
            // accept username as recipient or selectedRecipient
            const to = selectedRecipient || sendTo;
            const payload = { toUsername: to, amount: Number(sendAmount), method: 'wallet' };
            if (selectedSenderMethod) payload.senderMethodId = selectedSenderMethod;
            if (hasPin) payload.pin = pin;
            await dispatch(transferToUser(payload));
            setSendAmount(''); setSendTo('');
            setPin('');
            alert('Transfer successful');
        } catch (e) {
            alert('Transfer failed: ' + (e.response?.data?.message || e.message));
        }
    }

    const handleAddMethod = async (e) => {
        e.preventDefault();
        try {
            const payload = newMethodType === 'bank' ? { type: 'bank', accountNumber: newAccountNumber, ifsc: newIfsc } : { type: 'upi', upiId: newUpiId };
            const { data } = await axios.post('/api/v1/payments/methods', payload, { withCredentials: true });
            if (data && data.method) {
                setNewAccountNumber(''); setNewIfsc(''); setNewUpiId('');
                fetchMethods();
                alert('Method added');
            }
        } catch (e) { alert('Add method failed: ' + (e.response?.data?.message || e.message)); }
    }

    const fetchRecipients = async () => {
        try {
            const { data } = await axios.get('/api/v1/payments/recipients', { withCredentials: true });
            if (data && data.recipients) setRecipients(data.recipients);
        } catch (e) { console.debug('recipients fetch', e && e.message ? e.message : e); }
    }

    const fetchPinStatus = async () => {
        try {
            const { data } = await axios.get('/api/v1/payments/pin/status', { withCredentials: true });
            if (data) setHasPin(!!data.hasPin);
        } catch (e) { console.debug('pin status', e && e.message ? e.message : e); }
    }

    const handleDeleteMethod = async (id) => {
        if (!window.confirm('Delete this payment method?')) return;
        try {
            await axios.delete('/api/v1/payments/methods/' + id, { withCredentials: true });
            fetchMethods();
        } catch (e) { alert('Delete failed'); }
    }

    const handleSetDefault = async (id) => {
        try {
            await axios.post('/api/v1/payments/methods/' + id + '/set-default', {}, { withCredentials: true });
            fetchMethods();
        } catch (e) { alert('Set default failed'); }
    }

    return (
        <div className="mt-16 mx-auto max-w-2xl p-4">
            <h2 className="text-xl font-semibold mb-4">{paymentIcon}</h2>

            <div className="mb-6 p-4 border rounded">
                <div className="text-sm text-gray-500">Balance</div>
                <div className="text-2xl font-bold">₹{wallet && typeof wallet.balance === 'number' ? (wallet.balance/100).toFixed(2) : '0.00'}</div>
            </div>

            <form onSubmit={handleTopUp} className="mb-6">
                <h3 className="font-medium">Top Up</h3>
                <div className="flex gap-2 mt-2">
                    <input type="number" step="0.01" value={topAmount} onChange={e => setTopAmount(e.target.value)} placeholder="Amount (₹)" className="border p-2 rounded flex-1" />
                    <select value={topMethod} onChange={e=>setTopMethod(e.target.value)} className="border p-2 rounded w-40">
                        <option value="bank">Bank</option>
                        <option value="upi">UPI</option>
                    </select>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded">Top Up</button>
                </div>
            </form>

            <div className="mb-6 p-4 border rounded">
                <h3 className="font-medium mb-2">Payment Methods</h3>
                <div className="mb-4">
                    <form onSubmit={handleAddMethod} className="flex gap-2 items-center">
                        <select value={newMethodType} onChange={e=>setNewMethodType(e.target.value)} className="border p-2 rounded">
                            <option value="bank">Bank</option>
                            <option value="upi">UPI</option>
                        </select>
                        {newMethodType === 'bank' ? (
                            <>
                                <input value={newAccountNumber} onChange={e=>setNewAccountNumber(e.target.value)} placeholder="Account Number" className="border p-2 rounded" />
                                <input value={newIfsc} onChange={e=>setNewIfsc(e.target.value)} placeholder="IFSC" className="border p-2 rounded" />
                            </>
                        ) : (
                            <input value={newUpiId} onChange={e=>setNewUpiId(e.target.value)} placeholder="UPI ID" className="border p-2 rounded" />
                        )}
                        <button className="bg-gray-800 text-white px-3 py-2 rounded">Add</button>
                    </form>
                </div>

                <div className="space-y-2">
                    {(methods && methods.length) ? methods.map(m => (
                        <div key={m._id} className="flex items-center justify-between border p-2 rounded">
                            <div>
                                <div className="font-medium">{m.type.toUpperCase()} {m.isDefault && <span className="text-xs text-green-600">(default)</span>}</div>
                                <div className="text-sm text-gray-500">{m.details} {m.meta && m.meta.holderName ? '• ' + m.meta.holderName : ''}</div>
                            </div>
                            <div className="flex gap-2">
                                {!m.isDefault && <button onClick={()=>handleSetDefault(m._id)} className="text-sm text-blue-600">Set default</button>}
                                <button onClick={()=>handleDeleteMethod(m._id)} className="text-sm text-red-600">Delete</button>
                            </div>
                        </div>
                    )) : <div className="text-sm text-gray-500">No payment methods added</div>}
                </div>
            </div>

            <form onSubmit={handleSend} className="mb-6">
                <h3 className="font-medium">Send Money to Follower</h3>
                <div className="flex gap-2 mt-2 items-center">
                    <select value={selectedRecipient} onChange={e=>setSelectedRecipient(e.target.value)} className="border p-2 rounded w-1/3">
                        <option value="">Select recipient (followers with methods)</option>
                        {recipients.map(r => (
                            <option key={r._id} value={r.username}>{r.username} {r.paymentMethods && r.paymentMethods.length ? `• ${r.paymentMethods.map(m=>m.type).join(',')}` : ''}</option>
                        ))}
                    </select>
                    <select value={selectedSenderMethod} onChange={e=>setSelectedSenderMethod(e.target.value)} className="border p-2 rounded w-48">
                        <option value="">Use Wallet (default)</option>
                        {methods.map(m=> (
                            <option key={m._id} value={m._id}>{m.type.toUpperCase()} {m.details} {m.isDefault ? '(default)' : ''}</option>
                        ))}
                    </select>
                    <input type="number" step="0.01" value={sendAmount} onChange={e=>setSendAmount(e.target.value)} placeholder="Amount (₹)" className="border p-2 rounded flex-1" />
                    {hasPin && <input type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="PIN" className="border p-2 rounded w-28" />}
                    <button className="bg-primary-600 text-white px-4 py-2 rounded">Send</button>
                </div>
            </form>

            <div>
                <h3 className="font-medium mb-2">Recent Transactions</h3>
                <div className="border rounded p-2 max-h-64 overflow-auto">
                    {transactions && transactions.length ? transactions.map(t => (
                        <div key={t._id} className="flex justify-between py-2 border-b">
                            <div>
                                <div className="text-sm">{t.method} • {t.status}</div>
                                <div className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleString()}</div>
                            </div>
                            <div className="font-medium">₹{(t.amount/100).toFixed(2)}</div>
                        </div>
                    )) : <div className="text-sm text-gray-500">No transactions</div>}
                </div>
            </div>
        </div>
    )
}

export default Wallet;
