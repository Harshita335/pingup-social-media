import React from 'react';
import homepage from '../../assests/images/homepage.webp';

const Auth = ({ children }) => {
    return (
        <div className="w-full min-h-screen flex items-center justify-center p-6 app-bg">
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="hidden md:flex flex-col items-center justify-center gap-6 p-8">
                    <div className="w-full max-w-sm">
                        <img src={homepage} alt="app preview" className="w-full h-auto rounded-xl shadow-lg"/>
                    </div>
                    <h2 className="text-2xl font-semibold">Share moments. Connect with friends.</h2>
                    <p className="text-muted text-center">A fresh look — crafted with gradients, soft shadows and mobile-first responsiveness.</p>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Auth