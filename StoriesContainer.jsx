import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { stories } from "../../utils/constants";
import { useEffect, useState } from 'react';
import axios from '../../axiosConfig';
import AddStory from './AddStory';
import { useSelector } from 'react-redux';

const StoriesContainer = () => {

    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 7.5,
        slidesToScroll: 3,
        responsive: [
            {
                breakpoint: 1050,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 3
                }
            },
            {
                breakpoint: 400,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 2
                }
            }
        ]
    };

    const [active, setActive] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const { user: loggedInUser } = useSelector(state => state.user);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerUser, setViewerUser] = useState(null);
    const [viewerStories, setViewerStories] = useState([]);
    const [viewerIndex, setViewerIndex] = useState(0);
    const [currentStoryDetail, setCurrentStoryDetail] = useState(null);
    const [ownGroup, setOwnGroup] = useState(null);
    const [otherGroups, setOtherGroups] = useState([]);

    const fetchStories = async () => {
        try {
            const { data } = await axios.get('/api/v1/stories');
            const groups = data.stories || [];
            if (loggedInUser) {
                const own = groups.find(g => g.user._id === loggedInUser._id) || null;
                const others = groups.filter(g => g.user._id !== loggedInUser._id);
                setOwnGroup(own);
                setOtherGroups(others);
                // for backwards compatibility, set active to combined list with own first
                setActive(own ? [own, ...others] : others);
            } else {
                setOwnGroup(null);
                setOtherGroups(groups);
                setActive(groups);
            }
        } catch (e) {
            // ignore
        }
    }

    useEffect(()=>{ fetchStories(); },[]);

    // when viewer opens or index changes, register view (for non-owner) and fetch detail (for owner)
    useEffect(() => {
        let pollId = null;
        const registerAndFetch = async () => {
            if (!viewerOpen) return;
            const story = viewerStories[viewerIndex];
            if (!story) return;

            try {
                // if owner, fetch full details (including views)
                if (viewerUser && String(viewerUser._id) === String(loggedInUser?._id)) {
                    const res = await axios.get(`/api/v1/story/${story._id}`);
                    setCurrentStoryDetail(res.data.story);

                    // start polling every 2 seconds to keep viewers list live
                    if (!pollId) {
                        pollId = setInterval(async () => {
                            try {
                                const r = await axios.get(`/api/v1/story/${story._id}`);
                                setCurrentStoryDetail(r.data.story);
                            } catch (err) { /* ignore */ }
                        }, 2000);
                    }
                } else {
                    // register view for this user (adds to views)
                    await axios.post(`/api/v1/story/${story._id}/view`);
                    // update story lists so owner counters update quickly
                    fetchStories();
                }
            } catch (e) {
                // ignore silently
            }
        }
        registerAndFetch();

        return () => {
            if (pollId) clearInterval(pollId);
        }
    }, [viewerOpen, viewerIndex]);

    return (
        <>
            <Slider {...settings} className="w-full bg-white pt-2.5 pb-1 px-2.5 flex overflow-hidden border rounded">

                {/* Owner slot: show grouped stories if any, plus separate button to add story */}
                <div className="flex flex-col text-center justify-center items-center p-2">
                    {ownGroup ? (
                        <div className="relative w-16 h-16 rounded-full overflow-hidden cursor-pointer" onClick={() => { setViewerUser(ownGroup.user); setViewerStories(ownGroup.stories); setViewerIndex(0); setViewerOpen(true); }}>
                            <img draggable="false" loading="lazy" className="w-full h-full rounded-full object-cover border" src={ownGroup.user.avatar || loggedInUser?.avatar || '/public/uploads/profiles/default.png'} alt="you" />
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] shadow-md">
                                <button onClick={(e)=>{ e.stopPropagation(); setOpenModal(true); }} className="bg-primary-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-sm">+</button>
                            </div>
                            {/* hidden count badge for owner's stories */}
                            {ownGroup.stories && ownGroup.stories.reduce((a,s)=>a + (s.hiddenFrom ? s.hiddenFrom.length : 0),0) > 0 && (
                                <div className="absolute top-0 left-0 bg-white/80 px-1 rounded text-xs text-red-600 shadow">{ownGroup.stories.reduce((a,s)=>a + (s.hiddenFrom ? s.hiddenFrom.length : 0),0)}</div>
                            )}
                            {ownGroup.stories.length > 1 && (
                                <div className="absolute -top-1 left-0 bg-white px-1 rounded text-xs shadow">{ownGroup.stories.length}</div>
                            )}
                        </div>
                    ) : (
                        <div className="relative w-16 h-16 rounded-full overflow-hidden cursor-pointer" onClick={()=>setOpenModal(true)}>
                            <img draggable="false" loading="lazy" className="w-full h-full rounded-full object-cover border" src={loggedInUser?.avatar || '/public/uploads/profiles/default.png'} alt="you" />
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] shadow-md">
                                <div className="bg-primary-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-sm">+</div>
                            </div>
                        </div>
                    )}
                    <span className="text-xs">Your story</span>
                </div>

                {otherGroups.map((group, i) => (
                    <div key={i} className="flex flex-col text-center justify-center items-center p-2 cursor-pointer" onClick={() => { setViewerUser(group.user); setViewerStories(group.stories); setViewerIndex(0); setViewerOpen(true); }}>
                        <div className="relative w-16 p-[1px] h-16 rounded-full overflow-hidden">
                            <img loading="lazy" className="rounded-full h-full w-full border border-gray-300 object-cover" src={group.user.avatar || '/public/uploads/profiles/default.png'} draggable="false" alt="story" />
                            {group.stories.length > 1 && (
                                <div className="absolute -bottom-1 right-0 bg-white px-1 rounded text-xs shadow">{group.stories.length}</div>
                            )}
                            {group.stories && group.stories.reduce((a,s)=>a + (s.hiddenFrom ? s.hiddenFrom.length : 0),0) > 0 && (
                                <div className="absolute top-0 right-0 bg-white/80 px-1 rounded text-xs text-red-600 shadow">{group.stories.reduce((a,s)=>a + (s.hiddenFrom ? s.hiddenFrom.length : 0),0)}</div>
                            )}
                        </div>
                        <span className="text-xs">{group.user.username || group.user.name || 'user'}</span>
                    </div>
                ))}

            </Slider>

            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div onClick={()=>setOpenModal(false)} className="absolute inset-0 bg-black/40"></div>
                    <div className="relative z-10 w-[92%] max-w-md">
                        <div className="card p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold">Add Story</h3>
                                <button onClick={()=>setOpenModal(false)} className="text-muted">Close</button>
                            </div>
                            <AddStory onCreated={()=>{ setOpenModal(false); fetchStories(); }} />
                        </div>
                    </div>
                </div>
            )}

            {viewerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div onClick={()=>setViewerOpen(false)} className="absolute inset-0 bg-black/60"></div>
                    <div className="relative z-10 w-[95%] max-w-3xl">
                        <div className="card p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <img className="w-10 h-10 rounded-full object-cover" src={viewerUser?.avatar || '/public/uploads/profiles/default.png'} alt="user" />
                                    <div>
                                        <div className="font-semibold">{viewerUser?.username}</div>
                                        <div className="text-xs muted">{viewerStories.length} story(ies)</div>
                                    </div>
                                </div>
                                <button onClick={()=>setViewerOpen(false)} className="text-muted">Close</button>
                            </div>

                            <div className="flex items-center gap-4">
                                <button disabled={viewerIndex===0} onClick={()=>setViewerIndex(i=>Math.max(0,i-1))} className="px-3 py-2 bg-white rounded">Prev</button>
                                <div className="flex-1">
                                    {viewerStories[viewerIndex] && (
                                        <div className="w-full h-96 flex items-center justify-center bg-black/5 rounded">
                                            <div className="w-full h-full flex items-center justify-center">
                                                {viewerStories[viewerIndex].media.endsWith('.mp4') ? (
                                                    <video src={viewerStories[viewerIndex].media} controls className="max-h-96 max-w-full rounded" />
                                                ) : (
                                                    <img src={viewerStories[viewerIndex].media} alt="story" className="max-h-96 object-contain mx-auto rounded" />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button disabled={viewerIndex>=viewerStories.length-1} onClick={()=>setViewerIndex(i=>Math.min(viewerStories.length-1,i+1))} className="px-3 py-2 bg-white rounded">Next</button>
                            </div>

                            {viewerStories[viewerIndex] && viewerUser && String(viewerUser._id) === String(loggedInUser?._id) && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">Viewers</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm muted">{currentStoryDetail?.hiddenFrom?.length ? `${currentStoryDetail.hiddenFrom.length} hidden` : ''}</div>
                                            <button className="text-sm text-red-600" onClick={async ()=>{
                                                // delete this story
                                                try {
                                                    await axios.delete(`/api/v1/story/${viewerStories[viewerIndex]._id}`);
                                                    // remove from local list and refresh
                                                    const newList = viewerStories.filter((s, idx) => idx !== viewerIndex);
                                                    setViewerStories(newList);
                                                    fetchStories();
                                                    setCurrentStoryDetail(null);
                                                    if (newList.length === 0) setViewerOpen(false);
                                                    else setViewerIndex(i => Math.min(i, newList.length-1));
                                                } catch (e) {
                                                    // ignore
                                                }
                                            }}>Delete</button>
                                        </div>
                                    </div>

                                    <div className="max-h-40 overflow-auto mt-2">
                                        {currentStoryDetail && currentStoryDetail.views && currentStoryDetail.views.length > 0 ? (
                                            currentStoryDetail.views.map(v => (
                                                <div key={v._id || v.user._id} className="flex items-center gap-2 p-1">
                                                    <img src={v.user.avatar} className="w-8 h-8 rounded-full object-cover" />
                                                    <div>
                                                        <div className="text-sm">{v.user.username}</div>
                                                        <div className="text-xs muted">{new Date(v.viewedAt).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm muted">No views yet</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default StoriesContainer