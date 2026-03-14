import React from 'react';
import { motion } from 'motion/react';
import { PushNotif } from './PushNotifications';

interface NotifDetailProps {
    notif: PushNotif;
    onClose: () => void;
    isDark?: boolean;
}

export function NotifDetail({ notif, onClose, isDark }: NotifDetailProps) {
    const bg = isDark ? '#000000ff' : '#f3f4f6';
    const cardBg = isDark ? '#18181b' : '#ffffff';
    const textMain = isDark ? '#ffffff' : '#111827';
    const textSub = isDark ? '#a1a1aa' : '#52525b';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 99999,
                background: bg, display: 'flex', flexDirection: 'column',
                overflowY: 'auto',
            }}
        >
            {/* Header / Topbar */}
            <div style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'center', background: bg, position: 'sticky', top: 0, zIndex: 10 }}>
                <button
                    onClick={onClose}
                    style={{
                        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        border: 'none', width: 40, height: 40, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: textMain, cursor: 'pointer'
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 18, color: textMain, marginRight: 40 }}>
                    Notification
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    width: '100%', maxWidth: 400,
                    background: cardBg, borderRadius: 32, padding: '40px 24px',
                    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    textAlign: 'center', position: 'relative', overflow: 'hidden'
                }}>
                    {/* Background Grid & Gradient Effect */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                        background: `radial-gradient(circle at top, ${notif.color}15, transparent 70%)`,
                        pointerEvents: 'none', zIndex: 0
                    }} />

                    <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: notif.color + '22',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 40, margin: '24px 0', zIndex: 1,
                        boxShadow: `0 0 0 8px ${notif.color}11`
                    }}>
                        {notif.icon}
                    </div>

                    <h2 style={{ fontSize: 22, fontWeight: 900, color: textMain, marginBottom: 8, zIndex: 1, lineHeight: 1.3 }}>
                        {notif.title}
                    </h2>

                    <div style={{ width: 40, height: 4, borderRadius: 2, background: notif.color, margin: '8px auto 24px', zIndex: 1 }} />

                    <p style={{ fontSize: 16, color: textSub, lineHeight: 1.6, margin: 0, zIndex: 1 }}>
                        {notif.body}
                    </p>

                    <button
                        onClick={onClose}
                        style={{
                            marginTop: 40, background: notif.color, color: '#fff',
                            border: 'none', padding: '14px 28px', borderRadius: 20,
                            fontWeight: 700, fontSize: 16, width: '100%', cursor: 'pointer',
                            zIndex: 1, boxShadow: `0 8px 16px ${notif.color}33`
                        }}
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
