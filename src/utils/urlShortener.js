import axios from 'axios';

export const getShortURL = async url => {
    const config = {
        headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_BITLY_API_KEY}`,
            'Content-Type': 'application/json'
        }
    };
    const data = {
        "domain": "bit.ly",
        "long_url": url
    };
    try {
        let res = await axios.post('https://api-ssl.bitly.com/v4/shorten', data, config);
        if (res.status === 200) {
            return res.data.link;
        }
        throw new Error();
    } catch (error) { throw new Error(); }
};