import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api', // esta es la URL base del backend express
    headers: {
        'Content-Type': 'application/json',
    },
});

// esto es para inyectar utomáticamente el token JWT si existe
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// maneja errores globales (como token expirado / 401)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            console.warn('Sesión expirada o no autorizado.');
        }
        return Promise.reject(error);
    }
);

export default apiClient;
