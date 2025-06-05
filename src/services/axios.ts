import axios from 'axios';

// Sử dụng BE_BASE_URL trong cấu hình
const BE_BASE_URL = 'http://localhost:3000';

const response = axios.create({
  baseURL: BE_BASE_URL, // Sử dụng BE_BASE_URL thay vì hardcode lại URL
});

response.interceptors.response.use(
  function (response) {
    // Trả về data trực tiếp từ response để dễ dàng sử dụng
    return response.data;
  },
  function (error) {
    // Xử lý lỗi chi tiết hơn
    if (error.response) {
      // Có phản hồi từ server
      console.error('Error:', error.response.data || error.response.statusText);
    } else if (error.request) {
      // Không có phản hồi từ server
      console.error('No response received:', error.request);
    } else {
      // Lỗi khác (có thể là cấu hình hoặc vấn đề với request)
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export { response, BE_BASE_URL };
