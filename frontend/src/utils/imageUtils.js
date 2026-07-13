export const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8001${url.startsWith('/') ? '' : '/'}${url}`;
};
