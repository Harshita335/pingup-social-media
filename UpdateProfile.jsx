import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { clearErrors, loadUser, updateProfile, setBirthDate } from '../../../actions/userAction';
import profile from '../../../assests/images/hero.png';
import { UPDATE_PROFILE_RESET } from '../../../constants/userConstants';
import MetaData from '../../Layouts/MetaData';

const UpdateProfile = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const avatarInput = useRef(null);

    const { user } = useSelector((state) => state.user);
    const { error, isUpdated, loading } = useSelector((state) => state.profile);

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [email, setEmail] = useState("");
    const [birthDate, setBirthDateState] = useState("");
    const [oldAvatar, setOldAvatar] = useState("");
    const [avatar, setAvatar] = useState("");
    const [avatarPreview, setAvatarPreview] = useState("");

    const handleUpdate = (e) => {
        if (loading) return;
        if (e && e.preventDefault) e.preventDefault();

        const userCheck = /^[a-z0-9_.-]{6,25}$/igm;
        const finalUsername = username || (user && user.username) || '';

        if (!userCheck.test(finalUsername)) {
            toast.error("Invalid Username");
            return;
        }

        const formData = new FormData();
        formData.set("name", name || (user && user.name) || "");
        formData.set("username", username || (user && user.username) || "");
        if ((bio || (user && user.bio))) formData.set("bio", bio || user.bio);
        formData.set("email", email || (user && user.email) || "");
        if (birthDate) formData.set("birthDate", birthDate);
        if (avatar) formData.set("avatar", avatar);

        dispatch(updateProfile(formData));
    }

    const handleAvatarChange = (e) => {
        const reader = new FileReader();
        setAvatar("");
        reader.onload = () => {
            if (reader.readyState === 2) {
                setAvatarPreview(reader.result);
            }
        };
        reader.readAsDataURL(e.target.files[0]);
        setAvatar(e.target.files[0]);
    }

    useEffect(() => {
        if (user) {
            setName(user.name);
            setUsername(user.username);
            setBio(user.bio);
            setEmail(user.email);
            setOldAvatar(user.avatar);
            setBirthDateState(user.birthDate ? user.birthDate.split('T')[0] : '');
        }
        if (error) {
            toast.error(error);
            dispatch(clearErrors());
        }
        if (isUpdated) {
            toast.success("Profile Updated");
            // refresh user from server then navigate to updated username to avoid missing profile
            dispatch(loadUser()).then((data) => {
                const toUsername = data && data.user && data.user.username ? data.user.username : (user && user.username) ? user.username : username;
                if (toUsername && typeof toUsername === 'string' && toUsername !== 'undefined') {
                    // Force full page load to ensure server data is fetched and avoid stale client routing
                    window.location.href = `/${toUsername}`;
                } else {
                    toast.error('Unable to resolve username after update — reloading home.');
                    window.location.href = '/';
                }
            }).catch((err) => {
                console.error('loadUser failed after update:', err);
                window.location.href = '/';
            });

            dispatch({ type: UPDATE_PROFILE_RESET });
        }
    }, [dispatch, user, error, isUpdated]);

    return (
        <>
            <MetaData title="Edit Profile • PingUp" />

            <div className="relative w-full">

                <form
                    id="update-profile-form"
                    onSubmit={handleUpdate}
                    encType="multipart/form-data"
                    className="flex flex-col gap-4 py-4 px-4 sm:py-10 sm:px-24 sm:w-3/4"
                >
                <div className="flex items-center justify-between gap-8 ml-20 w-full">
                    <div className="w-11 h-11">
                        <img draggable="false" className="w-full h-full rounded-full border object-cover" src={avatarPreview ? avatarPreview : oldAvatar} alt="avatar" />
                    </div>
                    <div className="flex flex-col gap-0">
                        <span className="text-xl">{username}</span>
                        <label onClick={(e) => avatarInput.current.click()} className="text-sm font-medium text-primary-blue cursor-pointer">Change Profile Photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            name="avatar"
                            ref={avatarInput}
                            onChange={handleAvatarChange}
                            className="hidden" />
                    </div>
                    
                </div>
                <div className="flex w-full gap-8 text-right items-center">
                    <span className="w-1/4 font-semibold">Name</span>
                    <input
                        className="border rounded p-1 w-3/4"
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="flex w-full gap-8 text-right items-center">
                    <span className="w-1/4 font-semibold">Username</span>
                    <input
                        className="border rounded p-1 w-3/4"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                {/* Website removed per project request */}
                <div className="flex w-full gap-8 text-right items-start">
                    <span className="w-1/4 font-semibold">Bio</span>
                    <textarea
                        className="border rounded outline-none resize-none p-1 w-3/4"
                        name="bio"
                        placeholder="Bio"
                        rows="3"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        required
                    >
                    </textarea>
                </div>
                <div className="flex w-full gap-8 text-right items-center">
                    <span className="w-1/4 font-semibold">Email</span>
                    <input
                        className="border rounded p-1 w-3/4"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="flex w-full gap-8 text-right items-center">
                    <span className="w-1/4 font-semibold">Birth date</span>
                    <div className="w-3/4 flex items-center gap-3">
                        <input type="date" value={birthDate} onChange={(e)=>setBirthDateState(e.target.value)} className="border rounded p-1" />
                        {/* remove separate birthDate-only save; included in profile save */}
                        
                    </div>
                </div>
                <div className="flex w-full justify-center">
                    <button type="submit" disabled={loading} className="bg-primary-600 font-medium rounded text-white py-2 px-6 mt-4 text-sm hover:bg-primary-700 hover:drop-shadow-lg">Save</button>
                </div>
            </form>
            </div>
        </>
    )
}

export default UpdateProfile