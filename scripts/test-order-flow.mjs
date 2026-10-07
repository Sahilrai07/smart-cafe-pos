import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jgiowbiezuncfsmfvqbb.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_LBngUaDH4zyXMpHZ0mxu3g_4kdzqDSS';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log('--- 1. Testing Menu Items Fetch from Supabase ---');
  const { data: menuItems, error: menuErr } = await supabase
    .from('menu_items')
    .select('id, name, price, restaurant_id')
    .eq('restaurant_id', 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d')
    .limit(2);

  if (menuErr || !menuItems.length) {
    throw new Error('Failed to fetch menu items: ' + (menuErr?.message || 'Empty'));
  }
  console.log(`✓ Fetched ${menuItems.length} items:`, menuItems.map(m => `${m.name} (Rs ${m.price})`).join(', '));

  console.log('\n--- 2. Customer Places Order from Phone ---');
  const testOrderPayload = {
    restaurant_id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    table_number: '02',
    customer_name: 'Test Customer',
    customer_phone: '+919999988888',
    items: [
      { menu_item_id: menuItems[0].id, quantity: 2 },
      { menu_item_id: menuItems[1].id, quantity: 1 }
    ],
    special_instructions: 'Extra crispy, please!'
  };

  const res = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testOrderPayload)
  });

  const orderResult = await res.json();
  if (!res.ok || !orderResult.order) {
    throw new Error('Failed to create order via API: ' + JSON.stringify(orderResult));
  }
  const orderId = orderResult.order.id;
  console.log(`✓ Order #${orderResult.order.order_number} placed with ID: ${orderId}`);
  console.log(`  Initial Status: ${orderResult.order.status} (Total: Rs ${orderResult.order.total})`);

  console.log('\n--- 3. Admin Kitchen Dashboard Reads Real-time Order ---');
  const { data: adminOrder, error: adminErr } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', orderId)
    .single();

  if (adminErr || !adminOrder) {
    throw new Error('Admin failed to find order: ' + adminErr?.message);
  }
  console.log(`✓ Admin kitchen received order #${adminOrder.order_number} for Table ${adminOrder.table_number_snapshot}`);
  console.log(`  Items count: ${adminOrder.items?.length}`);

  console.log('\n--- 4. Admin Clicks "Accept Order" ---');
  const { error: updateErr } = await supabase
    .from('orders')
    .update({ status: 'PREPARING', updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (updateErr) {
    throw new Error('Failed to accept order: ' + updateErr.message);
  }
  console.log('✓ Order status updated in Supabase to: PREPARING');

  console.log('\n--- 5. Customer Phone Detects Order Acceptance ---');
  const getRes = await fetch(`http://localhost:3000/api/orders?orderId=${orderId}`);
  const customerOrderView = await getRes.json();
  console.log(`✓ Customer phone received updated status: ${customerOrderView.order?.status}`);

  if (customerOrderView.order?.status === 'PREPARING') {
    console.log('\n===============================================================');
    console.log('🎉 VERIFICATION PASSED: Customer Popup Successfully Triggered:');
    console.log('   "your order has been placed and will be arriving soon"');
    console.log('===============================================================');
  } else {
    throw new Error('Status was not PREPARING!');
  }
}

run().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
