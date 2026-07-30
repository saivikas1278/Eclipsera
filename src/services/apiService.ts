const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function fetchProductsFromAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch (e) {
    return null;
  }
}

function getAdminHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  try {
    const adminToken = localStorage.getItem('eclipsera_admin_token') || (localStorage.getItem('eclipsera_admin_logged') === 'true' ? 'eclipsera-admin-secure-session-token' : null);
    if (adminToken) {
      headers['x-admin-token'] = adminToken;
    }
  } catch (e) {}
  return headers;
}

export async function fetchOrdersFromAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchCouponsFromAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/coupons`);
    if (!res.ok) throw new Error('Failed to fetch coupons');
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchAuditLogsFromAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/audit-logs`, {
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function createOrderInAPI(orderData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function updateOrderStatusInAPI(orderId: string, status: string, courierName?: string, trackingNumber?: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({ status, courierName, trackingNumber })
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function createProductInAPI(productData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(productData)
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function updateStockInAPI(productId: string, variantId: string, stockQuantity: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/stock`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({ variantId, stockQuantity })
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function createCouponInAPI(couponData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/coupons`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(couponData)
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function uploadImageToAPI(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data && data.success && data.url) {
      return data.url;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function fetchReviewsFromAPI(productId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/${productId}`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function createReviewInAPI(reviewData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function registerUserInAPI(userData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function loginUserInAPI(credentials: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function loginWithGoogleInAPI(payload: string | { token?: string; email?: string; name?: string }) {
  try {
    const bodyData = typeof payload === 'string' ? { token: payload } : payload;
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function updateUserProfileInAPI(id: string, profileData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/profile/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function loginAdminInAPI(password: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchArtisansFromAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/artisans`);
    if (!res.ok) throw new Error('Failed to fetch artisans');
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function createArtisanInAPI(artisanData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/artisans`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(artisanData)
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function updateArtisanInAPI(id: string, artisanData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/artisans/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(artisanData)
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function deleteArtisanInAPI(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/artisans/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchProductCertificateFromAPI(productId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/certificate`);
    if (!res.ok) throw new Error('Failed to fetch certificate');
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function updateOrderFulfillmentInAPI(id: string, fulfillmentData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/fulfillment`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(fulfillmentData)
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function trackOrderPublicAPI(query: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/track/${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Shipment not found');
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function requestOrderReturnAPI(id: string, returnData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(returnData)
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchProductReviewsAPI(productId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function submitReviewAPI(reviewData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    return await res.json();
  } catch (e) {
    return { error: 'Network error submitting review' };
  }
}

export async function fetchAdminReviewsAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/admin/all`, {
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function moderateReviewAPI(reviewId: string, status: string, adminReply?: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/admin/${reviewId}/moderate`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ status, adminReply })
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function deleteReviewAPI(reviewId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/admin/${reviewId}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}
