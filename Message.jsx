
import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { editMessage, deleteMessage, toggleReaction } from '../../actions/messageAction'

const Message = ({ _id, sender, ownMsg, avatar, content, edited, unsent, reactions = [] }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.user);
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(content || '');
    const [showMenu, setShowMenu] = useState(false);
    const wrapperRef = useRef(null);
    useEffect(() => {
        const handleDocClick = (e) => {
            if (!wrapperRef.current) return;
            if (!wrapperRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        }
        document.addEventListener('click', handleDocClick);
        return () => document.removeEventListener('click', handleDocClick);
    }, []);

    if (unsent) {
        return (
            <div className={`self-start text-xs text-gray-400 italic`}>Message unsent</div>
        )
    }

    const handleSaveEdit = async () => {
        try {
            await dispatch(editMessage(_id, text));
            setEditing(false);
        } catch (e) { alert('Edit failed') }
    }

    const handleDelete = async () => {
        if (!window.confirm('Delete for me? Click cancel to Unsend for all.')) return;
        try {
            await dispatch(deleteMessage(_id, false));
        } catch (e) { alert('Delete failed') }
    }

    const handleUnsend = async () => {
        if (!window.confirm('Unsend this message for everyone?')) return;
        try {
            await dispatch(deleteMessage(_id, true));
        } catch (e) { alert('Unsend failed') }
    }

    const handleReact = async (emoji) => {
        try {
            await dispatch(toggleReaction(_id, emoji));
        } catch (e) { console.debug(e) }
    }

    return (
        <div className={`flex ${ownMsg ? 'justify-end' : 'justify-start'} items-center gap-2`}> 
            {!ownMsg && <img draggable="false" className="w-7 h-7 rounded-full object-cover" src={avatar} alt="avatar" />}
            <div className="relative">
                <div ref={wrapperRef}>
                    {editing ? (
                        <div className={`self-end text-sm text-white bg-violet-600 px-4 py-3 rounded-3xl max-w-xs`}>
                            <input value={text} onChange={e => setText(e.target.value)} className="p-1 rounded text-sm text-theme" />
                            <div className="flex gap-2 mt-1">
                                <button onClick={handleSaveEdit} className="text-xs btn-primary px-2 py-1 rounded">Save</button>
                                <button onClick={() => setEditing(false)} className="text-xs border px-2 py-1 rounded text-theme">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={`${ownMsg ? 'text-white bg-violet-600' : 'bg-gray-200 text-theme'} px-4 py-3 rounded-3xl max-w-xs`}> 
                                <div className="flex items-center gap-2">
                                    <span className="text-sm break-words text-theme">{content}</span>
                                    {edited && <span className="text-xs text-gray-400 ml-2">(edited)</span>}
                                </div>
                            </div>
                            {ownMsg && (
                                <button onClick={(e) => { e.stopPropagation(); setShowMenu(s => !s); }} className="ml-2 text-xs text-gray-500">•••</button>
                            )}
                        </>
                    )}
                </div>

                {/* menu */}
                {showMenu && ownMsg && (
                    <div className="absolute -top-6 right-0 bg-surface border-theme rounded p-1 text-xs flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setEditing(true); }} className="px-2">Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="px-2">Delete</button>
                        <button onClick={(e) => { e.stopPropagation(); handleUnsend(); }} className="px-2 text-red-600">Unsend</button>
                    </div>
                )}

                {/* reactions */}
                <div className="flex gap-1 mt-1">
                    {(reactions || []).slice(0,5).map((r, idx) => (
                        <button key={idx} onClick={() => handleReact(r.emoji)} className={`text-sm px-2 rounded ${String(r.user) === String(user._id) ? 'bg-yellow-200 text-theme' : 'bg-gray-100 text-theme'}`}>{r.emoji}</button>
                    ))}
                    <button onClick={() => handleReact('👍')} className="text-sm px-2 bg-gray-100 rounded text-theme">👍</button>
                    <button onClick={() => handleReact('❤️')} className="text-sm px-2 bg-gray-100 rounded text-theme">❤️</button>
                    <button onClick={() => handleReact('😂')} className="text-sm px-2 bg-gray-100 rounded text-theme">😂</button>
                </div>
            </div>
        </div>
    )
}

export default Message