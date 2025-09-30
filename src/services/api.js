// utils/api.js    (new api.js)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Enhanced API request function with comprehensive error handling
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const isFormData = options.body instanceof FormData;

  const config = {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
  };

  // If it's FormData, ensure we don't have any Content-Type header
  if (isFormData && config.headers['Content-Type']) {
    delete config.headers['Content-Type'];
  }

  // Enhanced logging for debugging
  console.group(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
  console.log('Config:', {
    url: `${API_BASE_URL}${endpoint}`,
    method: options.method || 'GET',
    hasAuth: !!token,
    isFormData,
    headers: config.headers
  });

  if (isFormData) {
    console.log('📦 FormData contents:');
    for (let [key, value] of options.body.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}:`, {
          type: 'File',
          name: value.name,
          size: `${(value.size / 1024).toFixed(2)}KB`,
          type: value.type,
          lastModified: new Date(value.lastModified).toISOString()
        });
      } else {
        console.log(`  ${key}:`, value);
      }
    }
  } else if (options.body && typeof options.body === 'string') {
    try {
      console.log('📝 JSON body:', JSON.parse(options.body));
    } catch {
      console.log('📝 Raw body:', options.body);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Log response details
    console.log('📡 Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      type: response.type,
      url: response.url
    });

    // Log response headers
    console.log('📋 Response Headers:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    let data;
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('✅ Parsed JSON response:', data);
      } else {
        const textResponse = await response.text();
        console.log('📄 Text response:', textResponse);
        
        // Try to parse as JSON anyway (some servers send JSON with wrong content-type)
        try {
          data = JSON.parse(textResponse);
          console.log('✅ Successfully parsed text as JSON:', data);
        } catch {
          data = textResponse ? { message: textResponse } : { success: response.ok };
        }
      }
    } catch (parseError) {
      console.error('❌ Response parsing error:', parseError);
      
      // Try to get raw text as fallback
      try {
        const fallbackText = await response.text();
        console.log('📄 Fallback raw response:', fallbackText);
        data = { 
          message: `Failed to parse response: ${parseError.message}`,
          status: response.status,
          rawResponse: fallbackText
        };
      } catch (textError) {
        console.error('❌ Could not read response as text:', textError);
        data = { 
          message: `Complete response parsing failure: ${parseError.message}`,
          status: response.status 
        };
      }
    }

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401 && token) {
        console.warn('🔐 Authentication failed, clearing token');
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
        console.groupEnd();
        return;
      }
      
      // Enhanced error message extraction
      let errorMessage = 'Request failed';
      let errorDetails = {};
      
      if (data) {
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = data.message;
          errorDetails = { ...data };
          delete errorDetails.message;
        } else if (data.error) {
          errorMessage = data.error;
          errorDetails = { ...data };
          delete errorDetails.error;
        } else if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.join(', ');
          errorDetails = { ...data };
        } else if (data.details) {
          errorMessage = data.details;
          errorDetails = { ...data };
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          errorDetails = data;
        }
      } else {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      const detailedError = new Error(errorMessage);
      detailedError.status = response.status;
      detailedError.statusText = response.statusText;
      detailedError.responseData = data;
      detailedError.endpoint = endpoint;
      detailedError.requestMethod = options.method || 'GET';
      
      console.error('❌ API Error Details:', {
        endpoint,
        method: options.method || 'GET',
        status: response.status,
        statusText: response.statusText,
        errorMessage,
        responseData: data,
        errorDetails,
        requestBody: isFormData ? 'FormData (logged above)' : options.body,
        timestamp: new Date().toISOString()
      });
      
      console.groupEnd();
      throw detailedError;
    }

    console.log('✅ Request completed successfully');
    console.groupEnd();
    return data;

  } catch (error) {
    // Network or other errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('🌐 Network Error:', {
        message: 'Failed to connect to server',
        endpoint,
        baseUrl: API_BASE_URL,
        possibleCauses: [
          'Server is down',
          'Network connectivity issues',
          'CORS configuration problems',
          'Invalid API base URL'
        ]
      });
      
      const networkError = new Error('Unable to connect to server. Please check your internet connection and try again.');
      networkError.isNetworkError = true;
      networkError.originalError = error;
      console.groupEnd();
      throw networkError;
    }
    
    // If it's already our detailed error, just re-throw it
    if (error.status || error.responseData) {
      console.groupEnd();
      throw error;
    }
    
    // Unexpected error
    console.error('❌ Unexpected API Error:', {
      endpoint,
      error: error.message,
      stack: error.stack,
      requestOptions: {
        ...options,
        body: isFormData ? 'FormData (logged above)' : options.body
      },
      timestamp: new Date().toISOString()
    });
    
    const unexpectedError = new Error(`Unexpected error: ${error.message}`);
    unexpectedError.originalError = error;
    unexpectedError.endpoint = endpoint;
    console.groupEnd();
    throw unexpectedError;
  }
};

// Updated blogsAPI in api.js
export const blogsAPI = {
  getAllBlogs: () => apiRequest('/blog', { method: 'GET' }),
  getBlogById: id => apiRequest(`/blog/${id}`, { method: 'GET' }),
  
  createBlog: async ({ formData }) => {
    return apiRequest('/blog/create', {
      method: 'POST',
      body: formData,
    });
  },
  
  // FIXED: updateBlog should also handle FormData, not JSON
  updateBlog: async ({ id, updates }) => {
    // If updates is FormData, send it directly
    if (updates instanceof FormData) {
      return apiRequest(`/blog/edit/${id}`, {
        method: 'PUT',
        body: updates,
      });
    }
    
    // Otherwise, wrap in JSON (fallback for non-FormData updates)
    return apiRequest(`/blog/edit/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ blogData: updates }),
    });
  },
  
  deleteBlog: id => apiRequest(`/blog/delete/${id}`, { method: 'DELETE' }),
};

export default apiRequest;