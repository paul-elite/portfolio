'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import styles from '@/app/home.module.css';

export type CardAction = { id: string; label: string; href: string };

const HOLD_MS = 320;
const HINT_KEY = 'avatar-card-seen';

// The small avatar opens a contact card when pressed and held (a click works too).
// The photo grows into the card, with the contact actions underneath.
export default function AvatarCard({ src, thumb, name, actions }: { src: string; thumb: string; name: string; actions: CardAction[] }) {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opened = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstAction = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    try {
      setHint(!localStorage.getItem(HINT_KEY));
    } catch {
      setHint(true);
    }
  }, []);

  const show = () => {
    opened.current = true;
    setOpen(true);
    setHint(false);
    try {
      localStorage.setItem(HINT_KEY, '1');
    } catch {}
  };
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const cancelHold = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => {
    if (!open) return;
    firstAction.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 420, damping: 36 };

  return (
    <div className={styles.avatarWrap}>
      <button
        ref={trigger}
        type="button"
        className={styles.avatarButton}
        aria-label={`Open ${name}’s contact card`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onPointerDown={() => {
          opened.current = false;
          cancelHold();
          timer.current = setTimeout(show, HOLD_MS);
        }}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onClick={() => {
          if (!opened.current) show();
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {!open && <motion.img layoutId="avatar-photo" src={thumb} alt="" draggable={false} className={styles.avatar} transition={spring} />}
      </button>

      {hint && (
        <span className={styles.hint} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 4.5a1.5 1.5 0 0 1 3 0V11l.6-.1a1.5 1.5 0 0 1 1.9 1.1l.1.4.7-.2a1.5 1.5 0 0 1 1.9 1.2l.6-.1a1.5 1.5 0 0 1 1.7 1.3l.4 3.2A5.5 5.5 0 0 1 14.5 23h-2.1a5.5 5.5 0 0 1-4.4-2.2l-3.3-4.5a1.6 1.6 0 0 1 2.3-2.2L9 15.5z" /></svg>
          Press down avatar
        </span>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.card}
            role="dialog"
            aria-modal="true"
            aria-label={`${name}’s contact card`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={(e) => e.target === e.currentTarget && close()}
          >
            <motion.img layoutId="avatar-photo" src={src} alt={name} draggable={false} className={styles.cardPhoto} transition={spring} />
            <motion.ul
              className={styles.cardActions}
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : 8 }}
              transition={{ duration: reduce ? 0 : 0.22, delay: reduce ? 0 : 0.08 }}
            >
              {actions.map((a, i) => (
                <li key={a.id}>
                  <a ref={i === 0 ? firstAction : undefined} href={a.href} target={a.id === 'email' ? undefined : '_blank'} rel="noreferrer">
                    <span className={styles.cardIcon}><Glyph id={a.id} /></span>
                    {a.label}
                  </a>
                </li>
              ))}
            </motion.ul>
            <button type="button" className={styles.cardClose} onClick={close}>Close</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Glyph({ id }: { id: string }) {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (id === 'email') return <svg {...p}><path d="M4 12a8 8 0 1 1 3.4 6.5L4 20l1.2-3.6A7.9 7.9 0 0 1 4 12z" /></svg>;
  if (id === 'instagram') return <svg {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" /></svg>;
  if (id === 'twitter') return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.9zm-1.1 16.2h1.7L7.4 4.7H5.6z" /></svg>;
  if (id === 'linkedin') return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3zm7 0h3.8v1.6h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.6 4.8 6v5.46h-4v-4.84c0-1.16-.02-2.64-1.6-2.64-1.62 0-1.86 1.26-1.86 2.56v4.92H10z" /></svg>;
  if (id === 'github') return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7c-.1-.3-.5-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .6 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.8V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z" /></svg>;
  if (id === 'behance') return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M2 6.5h5.4c2 0 3.3 1 3.3 2.7 0 1.1-.6 1.9-1.6 2.3 1.4.3 2.2 1.3 2.2 2.7 0 2-1.5 3.3-3.8 3.3H2zm2.3 2v2.9h2.8c1 0 1.5-.5 1.5-1.4 0-1-.6-1.5-1.6-1.5zm0 4.8v3.2h3c1.1 0 1.7-.6 1.7-1.6s-.6-1.6-1.8-1.6zM15 7.3h5.2v1.4H15zm2.7 2.7c2.6 0 4 1.8 3.9 4.6h-6c.1 1.4.9 2.2 2.2 2.2.9 0 1.6-.4 1.9-1.1h1.8c-.5 1.6-1.9 2.6-3.7 2.6-2.5 0-4.1-1.7-4.1-4.2 0-2.4 1.6-4.1 4-4.1zm1.9 3.4c-.1-1.2-.8-1.9-1.9-1.9s-1.8.7-2 1.9z" /></svg>;
  return <svg {...p}><circle cx="12" cy="12" r="8" /></svg>;
}
