import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

if (!process.env.REACT_APP_API_URL) {
    console.warn('REACT_APP_API_URL is not set! API requests will fail.');
}

api.interceptors.request.use(
    (config) => {
        console.log(`Interceptor running for URL: ${config.url}`);
        const token = localStorage.getItem('token');
        if (token) {
            console.log('Token found in localStorage. Attaching to header.');
            config.headers['Authorization'] = `Bearer ${token}`;
        } else {
            console.log('No token found in localStorage.');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api; 