import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      // A small delay to ensure the new page has started rendering
      setTimeout(() => window.scrollTo(0, 0), 0);
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;