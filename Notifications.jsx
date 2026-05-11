import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { markNotificationsRead, sendBirthdayMessage } from '../../actions/userAction'
import { toast } from 'react-toastify'

const Notifications = ({ notifications = [], className = '', onClose, loading = false }) => {
    const dispatch = useDispatch();
    const [sending, setSending] = useState({});

    useEffect(() => {
        // mark all as read when dropdown is opened
        (async () => {
            try {
                await dispatch(markNotificationsRead());
            } catch (e) {
                console.error('markNotificationsRead failed', e);
            }
        })();
    }, [dispatch]);

    const handleSendBirthday = async (n) => {
        const uname = n.data?.username;
        const uid = n.data?.userId;
        if (!uname && !uid) return toast.error('No recipient info');
        try {
            setSending((s) => ({ ...s, [n._id]: true }));
            await dispatch(sendBirthdayMessage({ username: uname, userId: uid, message: 'Happy Birthday! 🎉' }));
            toast.success('Birthday message sent');
        } catch (e) {
            toast.error('Failed to send message');
        } finally {
            setSending((s) => ({ ...s, [n._id]: false }));
        }
    }

    return (
        <div className={`absolute w-72 sm:w-80 bg-surface rounded drop-shadow-xl right-20 top-14 border-theme ${className}`}>
            <div className="absolute right-5 -top-2 rotate-45 h-4 w-4 bg-surface rounded-sm border-l border-t border-theme"></div>

            <div className="flex flex-col w-full overflow-auto max-h-80">
                {loading && (
                    <div className="p-3 text-sm text-muted-helper">Loading...</div>
                )}

                {!loading && notifications.length === 0 && (
                    <div className="p-3 text-sm text-muted-helper">No notifications</div>
                )}

                {!loading && (notifications || []).slice().sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt)).map((n) => (
                    <div key={n._id || n.createdAt} className={`flex items-start gap-3 p-3 text-sm hover:bg-surface border-b ${!n.read ? 'bg-surface' : ''}`}>
                        <div className="flex-1">
                            <div className="font-medium text-sm">{n.message}</div>
                            <div className="text-xs text-muted-helper mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                        {n.type === 'birthday' && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleSendBirthday(n)} disabled={sending[n._id]} className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-2 py-1 rounded">{sending[n._id] ? 'Sending...' : 'Say Happy Birthday'}</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Notifications