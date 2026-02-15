import { useEffect } from 'react';

export function useClickOutside(ref, isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return;

    function handleMouseDown(e) {
      if (!ref?.current) return;
      if (!ref.current.contains(e.target)) onClose?.();
    }

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [ref, isOpen, onClose]);
}
