import React, { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField';
import Auth from './Auth';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import BackdropLoader from '../Layouts/BackdropLoader';
import { useDispatch, useSelector } from 'react-redux';
import { clearErrors, loginUser } from '../../actions/userAction';

const Login = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, isAuthenticated, error, user } = useSelector((state) => state.user);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        dispatch(loginUser(email, password));
    }

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearErrors());
        }
        if (isAuthenticated) {
            navigate(`/${user.username}`)
        }
    }, [dispatch, error, isAuthenticated, navigate]);


    return (
        <>
            {loading && <BackdropLoader />}
            <Auth>
                <div className="card p-6 md:p-8 mb-4">
                    <div className="flex flex-col items-center gap-3">
                        <img draggable="false" className="h-12 w-auto object-contain" src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" alt="logo" />
                        <h3 className="text-xl font-semibold">Welcome back</h3>
                        <p className="text-sm muted">Log in to continue and see what your friends are sharing.</p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col justify-center items-stretch gap-3 mt-6">
                        <TextField
                            label="Email or Username"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            size="small"
                            fullWidth
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            size="small"
                            fullWidth
                        />
                        <button type="submit" className="btn-primary w-full">Log In</button>
                        <div className="text-center my-1">
                            <Link to="/password/forgot" className="text-sm font-medium text-primary-500">Forgot password?</Link>
                        </div>
                    </form>
                </div>

                <div className="card p-4 text-center">
                    <span>Don't have an account? <Link to="/register" className="text-primary-500 font-semibold">Sign up</Link></span>
                </div>
            </Auth>
        </>
    )
}

export default Login