'use client';

import { useEffect } from 'react';

export default function SiteInteractionGuards() {
  useEffect(() => {
    const protectedSelector = 'img, svg, picture, video, canvas';
    const interactiveAppSelector = '.scopeguard';
    const interactiveMediaSelector = 'a, button, input, label, select, textarea, [role="button"]';
    const editableSelector = 'input, textarea, select, [contenteditable="true"]';

    const canUseNativeInteraction = (event: Event) => {
      const target = event.target;

      return target instanceof Element && Boolean(target.closest(`${interactiveAppSelector}, ${editableSelector}`));
    };

    const preventDefault = (event: Event) => {
      if (canUseNativeInteraction(event)) {
        return;
      }

      event.preventDefault();
    };

    const preventMediaInteraction = (event: Event) => {
      const target = event.target;

      if (
        target instanceof Element &&
        target.closest(protectedSelector) &&
        !target.closest(interactiveMediaSelector)
      ) {
        event.preventDefault();
      }
    };

    const preventProtectedShortcuts = (event: KeyboardEvent) => {
      if (canUseNativeInteraction(event)) {
        return;
      }

      const key = event.key.toLowerCase();
      const isModifierPressed = event.metaKey || event.ctrlKey;

      if (isModifierPressed && ['c', 'x', 's', 'p'].includes(key)) {
        event.preventDefault();
      }
    };

    const lockMedia = () => {
      document.querySelectorAll<HTMLImageElement | HTMLVideoElement>(protectedSelector).forEach((element) => {
        element.draggable = false;
        element.setAttribute('draggable', 'false');
      });
    };

    lockMedia();
    const observer = new MutationObserver(lockMedia);
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('copy', preventDefault, true);
    document.addEventListener('cut', preventDefault, true);
    document.addEventListener('contextmenu', preventDefault, true);
    document.addEventListener('dragstart', preventDefault, true);
    document.addEventListener('selectstart', preventDefault, true);
    document.addEventListener('mousedown', preventMediaInteraction, true);
    document.addEventListener('pointerdown', preventMediaInteraction, true);
    document.addEventListener('touchstart', preventMediaInteraction, { capture: true, passive: false });
    document.addEventListener('keydown', preventProtectedShortcuts, true);

    return () => {
      observer.disconnect();
      document.removeEventListener('copy', preventDefault, true);
      document.removeEventListener('cut', preventDefault, true);
      document.removeEventListener('contextmenu', preventDefault, true);
      document.removeEventListener('dragstart', preventDefault, true);
      document.removeEventListener('selectstart', preventDefault, true);
      document.removeEventListener('mousedown', preventMediaInteraction, true);
      document.removeEventListener('pointerdown', preventMediaInteraction, true);
      document.removeEventListener('touchstart', preventMediaInteraction, true);
      document.removeEventListener('keydown', preventProtectedShortcuts, true);
    };
  }, []);

  return null;
}
