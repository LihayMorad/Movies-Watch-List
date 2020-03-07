export const debounce = (func, wait, immediate) => {
    let timeout;
    return function () {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, arguments);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, arguments);
    };
};