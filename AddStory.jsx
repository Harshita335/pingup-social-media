import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const AddStory = ({ onCreated }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [mode, setMode] = useState('now'); // 'now' or 'schedule'
    const [startAt, setStartAt] = useState('');
    const [endAt, setEndAt] = useState('');
    const [loading, setLoading] = useState(false);
    const [visibleToFollowers, setVisibleToFollowers] = useState(true);
    const [followers, setFollowers] = useState([]);
    const [selectedHidden, setSelectedHidden] = useState([]);
    const [search, setSearch] = useState('');
    const [showSelector, setShowSelector] = useState(false);

    const { user } = useSelector(state => state.user);

    useEffect(() => {
        // when mode is now, default start to now and end to +24 hours
        if (mode === 'now') {
            const now = new Date();
            const in24 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            setStartAt(''); // do not show a filled control for 'now'
            // set endAt UI default value in local datetime format
            const pad = (n) => String(n).padStart(2, '0');
            const toLocal = (d) => {
                const year = d.getFullYear();
                const month = pad(d.getMonth() + 1);
                const day = pad(d.getDate());
                const hours = pad(d.getHours());
                const mins = pad(d.getMinutes());
                return `${year}-${month}-${day}T${hours}:${mins}`;
            }
            setEndAt(toLocal(in24));
        }
    }, [mode]);

    useEffect(() => {
        // fetch current user's followers to allow hiding on create
        const fetchFollowers = async () => {
            try {
                if (!user || !user.username) return;
                const res = await axios.get(`/api/v1/user/${user.username}`);
                if (res.data && res.data.user && res.data.user.followers) {
                    setFollowers(res.data.user.followers);
                }
            } catch (err) {
                // ignore silently
            }
        }
        fetchFollowers();
    }, [user]);

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result);
        reader.readAsDataURL(f);
    }

    const applyDurationPreset = (hours) => {
        const now = new Date();
        if (mode === 'now') {
            const inHours = new Date(now.getTime() + hours * 60 * 60 * 1000);
            const pad = (n) => String(n).padStart(2, '0');
            const toLocal = (d) => {
                const year = d.getFullYear();
                const month = pad(d.getMonth() + 1);
                const day = pad(d.getDate());
                const hours = pad(d.getHours());
                const mins = pad(d.getMinutes());
                return `${year}-${month}-${day}T${hours}:${mins}`;
            }
            setEndAt(toLocal(inHours));
        } else {
            // schedule mode: if startAt set, base on startAt, else base on now
            const base = startAt ? new Date(startAt) : now;
            const inHours = new Date(base.getTime() + hours * 60 * 60 * 1000);
            const pad = (n) => String(n).padStart(2, '0');
            const toLocal = (d) => {
                const year = d.getFullYear();
                const month = pad(d.getMonth() + 1);
                const day = pad(d.getDate());
                const hours = pad(d.getHours());
                const mins = pad(d.getMinutes());
                return `${year}-${month}-${day}T${hours}:${mins}`;
            }
            if (!startAt) setStartAt(toLocal(base));
            setEndAt(toLocal(inHours));
        }
    }

    const submit = async (e) => {
        e.preventDefault();
        if (!file) return toast.error('Please select a photo or video');

        let finalStart, finalEnd;

        if (mode === 'now') {
            finalStart = new Date().toISOString();
            finalEnd = endAt ? new Date(endAt).toISOString() : new Date(Date.now() + 24*60*60*1000).toISOString();
        } else {
            if (!startAt) return toast.error('Please set start time');
            if (!endAt) return toast.error('Please set end time');
            finalStart = new Date(startAt).toISOString();
            finalEnd = new Date(endAt).toISOString();
        }

        if (new Date(finalStart) >= new Date(finalEnd)) return toast.error('End time must be after start time');

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('media', file);
            fd.append('startAt', finalStart);
            fd.append('endAt', finalEnd);
            fd.append('visibleToFollowers', visibleToFollowers);
            if (selectedHidden && selectedHidden.length) {
                fd.append('hiddenFrom', JSON.stringify(selectedHidden));
            }

            await axios.post('/api/v1/story/new', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Story scheduled');
            setFile(null); setPreview(null); setStartAt(''); setEndAt('');
            if (onCreated) onCreated();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Upload failed');
        } finally { setLoading(false); }
    }

    return (
        <div className="flex flex-col items-center p-2 w-full">
            <div className="flex items-center gap-3">
                <label className="relative rounded-full overflow-hidden w-20 h-20 cursor-pointer card flex items-center justify-center">
                    {preview ? (
                        <img src={preview} className="w-full h-full object-cover" alt="preview" />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-xl font-bold text-primary-500">+</div>
                    )}
                    <input type="file" accept="image/*,video/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                </label>

                <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                        <button type="button" onClick={() => setMode('now')} className={`${mode==='now' ? 'bg-primary-500 text-white' : 'bg-white'} px-3 py-1 rounded-lg shadow-sm`}>Now</button>
                        <button type="button" onClick={() => setMode('schedule')} className={`${mode==='schedule' ? 'bg-primary-500 text-white' : 'bg-white'} px-3 py-1 rounded-lg shadow-sm`}>Schedule</button>
                    </div>

                    <form onSubmit={submit} className="flex flex-col gap-2">
                        {mode === 'schedule' && (
                            <input type="datetime-local" value={startAt} onChange={(e)=>setStartAt(e.target.value)} className="px-3 py-2 rounded border" />
                        )}

                        <input type="datetime-local" value={endAt} onChange={(e)=>setEndAt(e.target.value)} className="px-3 py-2 rounded border" required />

                        <div className="flex gap-2 mt-2">
                            <button type="button" onClick={()=>applyDurationPreset(1)} className="px-2 py-1 rounded bg-white text-sm shadow-sm">1h</button>
                            <button type="button" onClick={()=>applyDurationPreset(6)} className="px-2 py-1 rounded bg-white text-sm shadow-sm">6h</button>
                            <button type="button" onClick={()=>applyDurationPreset(12)} className="px-2 py-1 rounded bg-white text-sm shadow-sm">12h</button>
                            <button type="button" onClick={()=>applyDurationPreset(24)} className="px-2 py-1 rounded bg-white text-sm shadow-sm">24h</button>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={visibleToFollowers} onChange={(e)=>setVisibleToFollowers(e.target.checked)} />
                                <span className="text-sm">Visible to followers only</span>
                            </label>
                        </div>

                        {followers && followers.length > 0 && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={()=>setShowSelector(s=>!s)} className="px-3 py-1 rounded bg-white shadow-sm flex items-center gap-2">
                                            <span className="text-primary-500">{selectedHidden.length === 0 ? 'Hide from followers' : `${selectedHidden.length} hidden`}</span>
                                        </button>

                                        {/* selected chips */}
                                        <div className="flex items-center gap-2">
                                            {selectedHidden.slice(0,6).map(id => {
                                                const f = followers.find(x => String(x._id) === String(id));
                                                if (!f) return null;
                                                return (
                                                    <div key={id} className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm">
                                                        <img src={f.avatar} className="w-6 h-6 rounded-full object-cover" />
                                                        <span className="text-xs">{f.username}</span>
                                                    </div>
                                                )
                                            })}
                                            {selectedHidden.length > 6 && <div className="text-xs muted">+{selectedHidden.length-6}</div>}
                                        </div>
                                    </div>
                                    <div className="text-sm muted">Hide from selected followers</div>
                                </div>

                                {showSelector && (
                                    <div className="border rounded p-3 bg-white shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <input className="flex-1 border p-2 rounded" placeholder="Search followers" value={search} onChange={(e)=>setSearch(e.target.value)} />
                                            <button type="button" onClick={()=>{ setSelectedHidden(followers.map(f=>f._id)); }} className="text-sm px-3 py-1 bg-gray-100 rounded">Select all</button>
                                            <button type="button" onClick={()=>{ setSelectedHidden([]); }} className="text-sm px-3 py-1 bg-gray-100 rounded">Clear</button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-auto">
                                            {followers.filter(f => f.username.toLowerCase().includes(search.toLowerCase())).map(f => (
                                                <label key={f._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                                                    <input type="checkbox" className="w-4 h-4" checked={selectedHidden.includes(f._id)} onChange={(e)=>{
                                                        if (e.target.checked) setSelectedHidden(prev=>[...prev, f._id]);
                                                        else setSelectedHidden(prev=>prev.filter(id=>id!==f._id));
                                                    }} />
                                                    <img src={f.avatar} className="w-10 h-10 rounded-full object-cover" alt={f.username} />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">{f.username}</div>
                                                        <div className="text-xs muted">{f.name || ''}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-2 mt-2">
                            <button className="btn-primary flex-1 py-2 rounded" disabled={loading}>{loading ? 'Uploading...' : (mode==='now' ? 'Share Now' : 'Schedule Story')}</button>
                        </div>
                    </form>
                    <div className="text-xs muted mt-2">Stories disappear after their end time. Use schedule to pick when to show.</div>
                </div>
            </div>
        </div>
    )
}

export default AddStory;
