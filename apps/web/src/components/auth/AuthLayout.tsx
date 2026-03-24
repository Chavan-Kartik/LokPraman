import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
    // Theme toggle
    const { theme, toggleTheme } = useTheme();
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const },
        },
    };

    return (
        <div className="linear-app-bg relative min-h-screen w-full flex overflow-hidden">
            {/* Theme Toggle Button - Top Right */}
            <button
                onClick={toggleTheme}
                className="absolute top-5 right-5 z-50 bg-[var(--background-elevated)] border border-[var(--border-default)] rounded-full p-2 shadow-md transition-colors hover:bg-[var(--surface)] text-[var(--foreground)]"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                {theme === 'dark' ? (
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 3v1"/><path d="M12 20v1"/><path d="M3 12h1"/><path d="M20 12h1"/><path d="M5.6 5.6l.7.7"/><path d="M18.4 18.4l.7.7"/><path d="M18.4 5.6l-.7.7"/><path d="M5.6 18.4l-.7.7"/><circle cx="12" cy="12" r="5"/></svg>
                ) : (
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>
                )}
            </button>
            <div className="linear-blob top-[-250px] left-[24%] h-[960px] w-[1300px] bg-[radial-gradient(circle,rgba(94,106,210,0.26)_0%,rgba(94,106,210,0.08)_45%,transparent_74%)]" />
            <div className="linear-blob top-[14%] left-[-220px] h-[680px] w-[840px] bg-[radial-gradient(circle,rgba(121,101,240,0.17)_0%,rgba(94,106,210,0.05)_56%,transparent_76%)] [animation-duration:10s]" />
            <div className="linear-blob bottom-[-300px] right-[-180px] h-[760px] w-[920px] bg-[radial-gradient(circle,rgba(94,106,210,0.14)_0%,rgba(94,106,210,0.04)_52%,transparent_78%)] [animation-duration:8.5s]" />

            {/* Left Side - Visual Story */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-14 overflow-hidden linear-elevated m-3 mr-1">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(94,106,210,0.24),transparent_60%)]" />

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="relative z-10"
                >
                    <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">LokPraman</h2>
                    <p className="text-xs font-medium mt-1 tracking-wide text-[var(--foreground-muted)]">Transparent Public Works</p>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="relative z-10 space-y-4"
                >
                    <p className="text-xs font-mono font-medium uppercase tracking-[0.22em] text-[var(--foreground-muted)]">Precision Workspace</p>
                    <h1 className="text-5xl font-semibold leading-[1.06] tracking-[-0.02em] text-[var(--foreground)]">
                        Build trust in public work with cinematic clarity.
                    </h1>
                    <p className="max-w-lg text-base leading-relaxed text-[var(--foreground-muted)]">
                        Every update, proof, and payout in one refined control surface designed for fast teams.
                    </p>
                </motion.div>

                {/* Footer copyright or similar */}
                <div className="relative z-10 text-xs text-[var(--foreground-muted)]">
                    © 2026 LokPraman. All rights reserved.
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full lg:w-1/2 px-6 md:px-14 py-10 md:py-12 flex flex-col justify-center"
            >
                <div className="max-w-lg mx-auto w-full space-y-8 linear-elevated rounded-2xl p-6 md:p-8">
                    <motion.div variants={itemVariants} className="space-y-2">
                        <h2 className="text-3xl font-semibold text-[var(--foreground)] tracking-tight">{title}</h2>
                        <p className="text-sm text-[var(--foreground-muted)]">{subtitle}</p>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        {children}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};
