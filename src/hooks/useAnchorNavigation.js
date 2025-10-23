import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useAnchorNavigation = (isAppReady) => {
  const location = useLocation();

  useEffect(() => {
    if (isAppReady && location.hash) {
      const id = location.hash.substring(1);
      
      const attemptScroll = (retries = 10, delay = 100) => {
        const element = document.getElementById(id);
        if (element) {
          const headerOffset = 80; // Height of the sticky header
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        } else if (retries > 0) {
          setTimeout(() => attemptScroll(retries - 1, delay), delay);
        }
      };

      attemptScroll();
    }
  }, [location.hash, isAppReady]);
};

export default useAnchorNavigation;