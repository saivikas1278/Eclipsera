const http = require('http');

const API_BASE = 'http://localhost:5000/api';

async function fetchJSON(url, options = {}) {
  try {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch(API_BASE + url, options);
    const json = await res.json();
    return { status: res.status, data: json };
  } catch (e) {
    console.error('Fetch error:', e);
    return { status: 500, data: { error: e.message } };
  }
}

async function runTest() {
  console.log('--- Phase 3 Sync Verification Test ---');

  // 1. Generate Test User
  const email = `test_sync_${Date.now()}@eclipsera.com`;
  console.log('1. Registering user:', email);
  const { data: regData } = await fetchJSON('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Sync Tester', email, phone: Date.now().toString().substring(3), password: 'password123' })
  });
  console.log('Registration response:', regData);
  const userId = regData.user ? regData.user.id : (regData.id || 'test');
  const userToken = `usr_session_${userId}`;
  const userHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` };

  // 2. Connect Admin SSE
  console.log('2. Connecting Admin SSE Stream...');
  const EventSource = require('eventsource');
  const adminSse = new (require('eventsource').EventSource)(`${API_BASE}/notifications/stream`);
  let newOrderReceived = false;
  let orderId = null;

  adminSse.addEventListener('NEW_ORDER', (e) => {
    const order = JSON.parse(e.data);
    console.log('Received NEW_ORDER on admin stream:', order.id);
    console.log('✅ Admin received NEW_ORDER instantly:', order.id);
    newOrderReceived = true;
    orderId = order.id;
  });

  // 3. Connect User SSE
  console.log('3. Connecting User SSE Stream...');
  const userSse = new (require('eventsource').EventSource)(`${API_BASE}/notifications/stream?recipientType=USER&recipientId=${userId}`);
  let orderUpdatedReceived = false;

  userSse.addEventListener('ORDER_UPDATED', (e) => {
    const order = JSON.parse(e.data);
    console.log('Received ORDER_UPDATED on user stream:', order.id, 'Status:', order.status);
    if (order.id === orderId && order.status === 'SHIPPED') {
      console.log('✅ User received ORDER_UPDATED instantly! Status:', order.status);
      orderUpdatedReceived = true;
    }
  });

  // Wait a bit for SSE connections to establish
  await new Promise(r => setTimeout(r, 1000));

  // 4. Create an Order as User
  console.log('4. User places an order...');
  const orderRes = await fetchJSON('/orders', {
    method: 'POST',
    headers: userHeaders,
    body: JSON.stringify({
      items: [{ productId: 'prod-1', variantId: 'v1-1', quantity: 1, unitPrice: 1290 }],
      grandTotal: 1523,
      paymentMethod: 'razorpay',
      shippingAddress: { street: 'Test St', city: 'Test City' }
    })
  });
  console.log('Order creation response:', orderRes);

  // Wait for SSE broadcast
  await new Promise(r => setTimeout(r, 1000));
  
  if (!newOrderReceived) {
    console.error('❌ Failed to receive NEW_ORDER event on Admin stream.');
    process.exit(1);
  }

  // 5. Admin Updates Order Status
  console.log('5. Admin updates order status to SHIPPED...');
  const adminHeaders = { 'Content-Type': 'application/json', 'x-admin-token': `eclipsera-admin-secure-session-token` };
  const statusRes = await fetchJSON(`/orders/${orderId}/status`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({ status: 'SHIPPED', courierName: 'Test Courier', trackingNumber: 'TEST-AWB-123' })
  });
  console.log('Admin status update response:', statusRes);

  // Wait for SSE broadcast
  await new Promise(r => setTimeout(r, 1000));

  if (!orderUpdatedReceived) {
    console.error('❌ Failed to receive ORDER_UPDATED event on User stream.');
    process.exit(1);
  }

  console.log('🎉 End-to-End Sync Verification SUCCESS!');
  adminSse.close();
  userSse.close();
  process.exit(0);
}

runTest();
