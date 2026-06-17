'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

function isElementVisibleInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

  return rect.bottom > 0 && rect.right > 0 && rect.top < viewportHeight && rect.left < viewportWidth;
}

export function useCatalogPaginationVisibility() {
  const pathname = usePathname();
  const [isPaginationVisible, setIsPaginationVisible] = useState(false);

  useEffect(() => {
    if (pathname !== '/catalogo') {
      setIsPaginationVisible(false);
      return;
    }

    let animationFrameId: number | null = null;
    let mutationObserver: MutationObserver | null = null;

    const updateVisibility = () => {
      animationFrameId = null;
      const mobileActions = document.getElementById('catalog-pagination-actions');

      if (!(mobileActions instanceof HTMLElement)) {
        setIsPaginationVisible(false);
        return;
      }

      setIsPaginationVisible(isElementVisibleInViewport(mobileActions));
    };

    const requestVisibilityUpdate = () => {
      if (animationFrameId !== null) return;
      animationFrameId = window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();

    window.addEventListener('scroll', requestVisibilityUpdate, { passive: true });
    window.addEventListener('resize', requestVisibilityUpdate);
    window.visualViewport?.addEventListener('resize', requestVisibilityUpdate);

    mutationObserver = new MutationObserver(requestVisibilityUpdate);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('scroll', requestVisibilityUpdate);
      window.removeEventListener('resize', requestVisibilityUpdate);
      window.visualViewport?.removeEventListener('resize', requestVisibilityUpdate);
      mutationObserver?.disconnect();
    };
  }, [pathname]);

  return pathname === '/catalogo' && isPaginationVisible;
}
