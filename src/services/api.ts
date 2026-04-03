export const API_URL = import.meta.env.VITE_API_URL || 'https://invoiceb.onrender.com';

// Example function to check backend health
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/`);
    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Error connecting to backend:', error);
    throw error;
  }
};
