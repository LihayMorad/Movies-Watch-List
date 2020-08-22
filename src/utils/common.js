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

const timestampToDays = timestamp => timestamp / 1000 / 60 / 60 / 24;
export const hasExpired = timestamp => timestampToDays(Date.now() - timestamp) > 1;