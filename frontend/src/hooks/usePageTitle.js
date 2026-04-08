import { useEffect } from 'react';

const APP_NAME = 'Klink';

/**
 * Sets the document title for the current page.
 * @param {string} title — Page-specific title (e.g. "My QR Codes")
 */
const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
    return () => { document.title = APP_NAME; };
  }, [title]);
};

export default usePageTitle;
