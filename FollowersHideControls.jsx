import React, { useEffect, useState } from 'react';
import axios from '../../axiosConfig';
import { useSelector } from 'react-redux';

const FollowersHideControls = ({ storyId, onUpdated }) => {
    const { user: loggedInUser } = useSelector(state => state.user);
    const [followers, setFollowers] = useState([]);
    const [hiddenSet, setHiddenSet] = useState(new Set());
    const [loadingMap, setLoadingMap] = useState({});

    useEffect(() => {
        // fetch followers and story to determine which followers are hidden
        const fetch = async () => {
            if (!loggedInUser) return;
            try {
                const [{ data: userData }, { data: storyData }] = await Promise.all([
                    axios.get(`/api/v1/user/${loggedInUser.username}`),
                    axios.get(`/api/v1/story/${storyId}`)
                ]);

                const followersList = userData.user.followers || [];
                setFollowers(followersList);

                const hidden = new Set((storyData.story.hiddenFrom || []).map(id => String(id)));
                setHiddenSet(hidden);
            } catch (e) {
                // ignore - keep empty
            }
        }
        fetch();
    }, [loggedInUser, storyId]);

    const toggle = async (followerId, hide) => {
        setLoadingMap(m => ({ ...m, [followerId]: true }));
        try {
            await axios.post(`/api/v1/story/${storyId}/hide`, { followerId, hide });
            setHiddenSet(s => {
                const next = new Set(Array.from(s));
                if (hide) next.add(String(followerId)); else next.delete(String(followerId));
                return next;
            });
            if (onUpdated) onUpdated();
        } catch (e) {
            // ignore
        } finally { setLoadingMap(m => ({ ...m, [followerId]: false })); }
    }

    return (
        <div className="mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-auto">
                {followers.map(f => (
                    <div key={f._id} className="flex items-center gap-3 p-2 bg-white rounded shadow-sm">
                        <img className="w-10 h-10 rounded-full object-cover" src={f.avatar} alt={f.username} />
                        <div className="flex-1">
                            <div className="font-medium text-sm">{f.username}</div>
                            <div className="text-xs muted">{f.name || ''}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={hiddenSet.has(String(f._id))} onChange={(e)=>toggle(f._id, e.target.checked)} disabled={!!loadingMap[f._id]} />
                                <span className="text-sm">Hidden</span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>
            {Object.values(loadingMap).some(Boolean) && <div className="text-xs muted mt-2">Updating...</div>}
        </div>
    )
}

export default FollowersHideControls;
