import React, { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField';
import Auth from './Auth';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { clearErrors, registerUser } from '../../actions/userAction';
import BackdropLoader from '../Layouts/BackdropLoader';

const SignUp = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, isAuthenticated, error } = useSelector((state) => state.user);

    const [user, setUser] = useState({
        email: "",
        name: "",
        username: "",
        password: "",
    });

    const { email, name, username, password } = user;

    const [avatar, setAvatar] = useState();
    const [avatarPreview, setAvatarPreview] = useState();

    const handleRegister = (e) => {
        e.preventDefault();

        const userCheck = /^[a-z0-9_.-]{6,25}$/igm;

        if (password.length < 8) {
            toast.error("Password length must be atleast 8 characters");
            return;
        }
        if (!avatar) {
            toast.error("Select Profile Pic");
            return;
        }
        if (!userCheck.test(username)) {
            toast.error("Invalid Username");
            return;
        }

        const formData = new FormData();
        formData.set("email", email);
        formData.set("name", name);
        formData.set("username", username);
        formData.set("password", password);
        formData.set("avatar", avatar);

        dispatch(registerUser(formData));
    }

    const handleDataChange = (e) => {
        if (e.target.name === 'avatar') {
            const reader = new FileReader();

            reader.onload = () => {
                if (reader.readyState === 2) {
                    setAvatarPreview(reader.result);
                }
            };

            reader.readAsDataURL(e.target.files[0]);
            // console.log(e.target.files[0])
            setAvatar(e.target.files[0])

        } else {
            setUser({ ...user, [e.target.name]: e.target.value });
        }
    }

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearErrors());
        }
        if (isAuthenticated) {
            navigate('/')
        }
    }, [dispatch, error, isAuthenticated, navigate]);

    return (
        <>
            {loading && <BackdropLoader />}
            <Auth>
                <div className="card p-6 md:p-8 mb-4">
                    <div className="flex flex-col items-center gap-4">
                        <img draggable="false" className="h-12 w-auto object-contain" src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" alt="logo" />
                        <h3 className="text-xl font-semibold">Create your account</h3>
                        <p className="text-sm muted text-center">Join the community — share photos, follow friends and explore.</p>
                    </div>

                    <form
                        onSubmit={handleRegister}
                        encType="multipart/form-data"
                        className="flex flex-col justify-center items-stretch gap-3 mt-6"
                    >
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={handleDataChange}
                            required
                            size="small"
                        />
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="name"
                            value={name}
                            onChange={handleDataChange}
                            required
                            size="small"
                        />
                        <TextField
                            label="Username"
                            type="text"
                            name="username"
                            value={username}
                            onChange={handleDataChange}
                            size="small"
                            required
                            fullWidth
                        />
                        <TextField
                            label="Password"
                            type="password"
                            name="password"
                            value={password}
                            onChange={handleDataChange}
                            required
                            size="small"
                            fullWidth
                        />

                        <div className="flex items-center gap-3">
                            <Avatar alt="Avatar Preview" src={avatarPreview} sx={{ width: 56, height: 56 }} />
                            <label className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    name="avatar"
                                    onChange={handleDataChange}
                                    className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:cursor-pointer file:font-medium file:bg-white file:text-primary-500 hover:file:bg-gray-50"
                                />
                            </label>
                        </div>

                        <button type="submit" className="btn-primary w-full">Sign up</button>
                        <div className="text-center my-1 text-sm muted">By signing up you agree to our terms.</div>
                    </form>
                </div>

                <div className="card p-4 text-center">
                    <span>Already have an account? <Link to="/login" className="text-primary-500 font-semibold">Log in</Link></span>
                </div>
            </Auth>
        </>
    )
}

export default SignUp