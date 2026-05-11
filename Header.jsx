import React, { useEffect, useState } from 'react'
import { exploreOutline, homeFill, homeOutline, likeFill, likeOutline, messageFill, messageOutline, postUploadOutline, paymentIcon } from './SvgIcons'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ProfileDetails from './ProfileDetails';
import NewPost from './NewPost';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import Notifications from './Notifications';
import DesignSettings from '../Layouts/DesignSettings';
import { useTheme } from '../../context/ThemeContext';
import { getNotifications } from '../../actions/userAction';
import { io } from 'socket.io-client';
import { SOCKET_ENDPOINT } from '../../utils/constants';
import { toast } from 'react-toastify';
import SearchBox from './SearchBar/SearchBox';
import { ClickAwayListener } from '@mui/material';

const Header = () => {

    const { user, loading: userLoading } = useSelector((state) => state.user);

    const [profileToggle, setProfileToggle] = useState(false)
    const [newPost, setNewPost] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [designOpen, setDesignOpen] = useState(false);
    const { theme, setTheme } = useTheme();

    const dispatch = useDispatch();
    const socketRef = React.useRef(null);
    const navigate = useNavigate();

    const location = useLocation();
    const [onHome, setOnHome] = useState(false);
    const [onChat, setOnChat] = useState(false);

    useEffect(() => {
        setOnHome(location.pathname === "/")
        setOnChat(location.pathname.split('/').includes("direct"))
    }, [location]);

    // fetch notifications once when the logged-in user's id becomes available
    useEffect(() => {
        const userId = user && (user._id || user.id);
        if (!userId) return;

        dispatch(getNotifications());

        // connect socket and listen for server notifications
        try {
            socketRef.current = io(SOCKET_ENDPOINT);
            socketRef.current.emit('addUser', userId);
            socketRef.current.on('notification', (payload) => {
                // payload expected { to: <userId>, type, message, data }
                if (payload && (payload.to === userId || payload.to === String(userId))) {
                    dispatch(getNotifications());
                    if (payload.message) toast.info(payload.message);
                }
            });
        } catch (e) {
            console.debug('socket connect failed', e && e.message ? e.message : e);
        }

        return () => {
            try { socketRef.current?.disconnect(); } catch (e) { }
        };
        // only re-run when id changes
    }, [user && (user._id || user.id), dispatch]);

    return (
        <nav className="navbar fixed top-0 w-full border-b z-10">
            {/* <!-- navbar container --> */}
            <div className="flex flex-row justify-between items-center py-2 px-3.5 sm:w-full sm:py-2 sm:px-4 md:w-full md:py-2 md:px-6 xl:w-4/6 xl:py-3 xl:px-8 mx-auto">

                {/* <!-- logo --> */}
                {/* <Link to="/"><img draggable="false" className="mt-1.5 w-full h-full object-contain" src="\*#C:\Users\anuj mishra\OneDrive\Desktop\Pingup\pingup\frontend\public\logo192.png*\" alt="" /></Link> */}
                <Link to="/"><img draggable="false" className="mt-1.5 object-contain" src="/logo192.png" alt="logo" style={{ width: '65px', height: '65px' }} /></Link>
                <SearchBox />

                {/* <!-- icons container  --> */}
                <div className="flex items-center space-x-6 sm:mr-5">
                    <Link to="/">{profileToggle || !onHome ? homeOutline : homeFill}</Link>

                    <Link to="/direct/inbox">{onChat ? messageFill : messageOutline}</Link>

                    <div onClick={() => setNewPost(true)} className="cursor-pointer">{postUploadOutline}</div>

                    {/* payment icon link (visible on all sizes) */}
                    <button onClick={() => navigate('/wallet')} className="text-sm font-medium text-gray-700 hover:underline">{paymentIcon}</button>

                    {/* theme toggle (icon) + design settings (palette) */}
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle theme" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        {theme === 'dark' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor"/></svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.76 4.84l-1.8-1.79L3.17 4.84 4.97 6.63 6.76 4.84zM1 13h3v-2H1v2zm10 9h2v-3h-2v3zm7.24-3.76l1.8 1.79 1.79-1.79-1.8-1.79-1.79 1.79zM20 13v-2h3v2h-3zM12 4a1 1 0 011-1h0a1 1 0 110 2h0A1 1 0 0112 4zM4.24 19.16l1.79-1.79L4.24 15.58 2.45 17.37l1.79 1.79z" fill="currentColor"/></svg>
                        )}
                    </button>

                    <button onClick={() => setDesignOpen(true)} title="Design settings" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3C7 3 3 7 3 12s4 9 9 9c1.6 0 3.09-.42 4.39-1.16C20.26 18.05 21 17.07 21 16c0-1.66-1.34-3-3-3-.78 0-1.49.3-2.04.77C14.45 11.4 13.3 9.5 12 9.5 10.07 9.5 8.5 11.07 8.5 13S10.07 16.5 12 16.5c.65 0 1.26-.17 1.78-.47C16.04 18 14.12 19 12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7z" fill="currentColor"/></svg>
                    </button>

                    {/* <span className="hidden sm:block">{exploreOutline}</span> */}
                    <span className="hidden sm:block cursor-pointer relative" onClick={() => setShowNotif(!showNotif)}>
                        {likeOutline}
                        {/* badge */}
                        {user && user.notifications && user.notifications.filter(n => !n.read).length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">{user.notifications.filter(n => !n.read).length}</span>
                        )}
                    </span>

                    <div onClick={() => setProfileToggle(!profileToggle)} className={`${profileToggle && 'border-black border' || (!onHome && !onChat) && 'border-black border'} rounded-full cursor-pointer h-7 w-7 p-[0.5px]`}><img draggable="false" loading="lazy" className="w-full h-full rounded-full object-cover" src={user.avatar} alt="" /></div>
                </div>

                {profileToggle &&
                    <ProfileDetails setProfileToggle={setProfileToggle} />
                }

                {showNotif && (
                    <Notifications loading={userLoading} notifications={user && user.notifications ? user.notifications : []} onClose={() => setShowNotif(false)} />
                )}

                <NewPost newPost={newPost} setNewPost={setNewPost} />

            {designOpen && <DesignSettings open={designOpen} onClose={() => setDesignOpen(false)} />}

            </div>
        </nav>
    )
}

export default Header