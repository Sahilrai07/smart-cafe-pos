import { getDaysUntilBirthday, filterUpcomingBirthdays } from '../src/lib/birthday';
import { buildBillWhatsAppUrl, buildBirthdayWhatsAppUrl } from '../src/lib/whatsapp';
import { DEMO_RESTAURANTS, DEMO_SETTINGS } from '../src/lib/demoData';
import { Customer, OrderItem, Bill } from '../src/types';

function runVerificationTests() {
  console.log('--- STARTING MULTI-TENANT CAFE SAAS LOGIC VERIFICATION ---\n');

  // TEST 1: Annual Birthday Detection & 7-Day Reminder
  console.log('[TEST 1] Testing 7-Day Birthday Engine:');
  const today = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(today.getDate() + 7);

  const yyyy = sevenDaysLater.getFullYear();
  const mm = String(sevenDaysLater.getMonth() + 1).padStart(2, '0');
  const dd = String(sevenDaysLater.getDate()).padStart(2, '0');
  const targetBdayStr = `2000-${mm}-${dd}`; // Born in 2000, 7 days from now

  const { daysUntil, nextBirthdayStr } = getDaysUntilBirthday(targetBdayStr);
  console.log(`  Target DOB: ${targetBdayStr}`);
  console.log(`  Calculated Days Until Next Birthday: ${daysUntil}`);
  console.log(`  Next Birthday Date: ${nextBirthdayStr}`);

  if (daysUntil !== 7) {
    throw new Error(`Expected exactly 7 days until birthday, got ${daysUntil}`);
  }
  console.log('  ✓ Test 1 Passed: Correctly identified birthday occurring exactly 7 days from today!\n');

  // TEST 2: Upcoming Birthday Filtering
  console.log('[TEST 2] Testing filterUpcomingBirthdays:');
  const testCustomers: Customer[] = [
    {
      id: 'cust-1',
      restaurant_id: DEMO_RESTAURANTS[0].id,
      name: 'Pooja Patel',
      phone: '+919812345678',
      birthday: targetBdayStr,
      birthday_club_member: true,
      marketing_opt_in: true,
      total_visits: 5,
      total_spent: 2450,
    },
    {
      id: 'cust-2',
      restaurant_id: DEMO_RESTAURANTS[0].id,
      name: 'Amit Verma',
      phone: '+919700012345',
      birthday: '1995-01-01', // Past date, far away
      birthday_club_member: true,
      marketing_opt_in: true,
      total_visits: 1,
      total_spent: 380,
    },
  ];

  const eligible = filterUpcomingBirthdays(testCustomers, 7);
  console.log(`  Eligible customers count: ${eligible.length}`);
  if (eligible.length !== 1 || eligible[0].name !== 'Pooja Patel') {
    throw new Error('Expected only Pooja Patel in 7-day upcoming birthdays list');
  }
  console.log('  ✓ Test 2 Passed: Correctly filtered upcoming birthday customer!\n');

  // TEST 3: WhatsApp Click-to-Chat Bill URL Generation
  console.log('[TEST 3] Testing WhatsApp Click-to-Chat Bill URL:');
  const sampleItems: OrderItem[] = [
    { item_name_snapshot: 'Classic Veg Burger', quantity: 1, unit_price_snapshot: 120, total: 120 },
    { item_name_snapshot: 'Chilled Coke', quantity: 2, unit_price_snapshot: 40, total: 80 },
    { item_name_snapshot: 'Crispy Fries', quantity: 1, unit_price_snapshot: 60, total: 60 },
  ];

  const sampleBill: Bill = {
    id: 'bill-1042',
    restaurant_id: DEMO_RESTAURANTS[0].id,
    order_id: 'ord-1042',
    customer_id: 'cust-rahul',
    customer_name: 'Rahul Sharma',
    customer_phone: '+91 9876543210',
    bill_number: '1042',
    table_number_snapshot: '04',
    subtotal: 260,
    tax: 13,
    discount: 0,
    total: 273,
    items_snapshot: sampleItems,
    generated_at: new Date().toISOString(),
  };

  const billUrl = buildBillWhatsAppUrl({
    bill: sampleBill,
    restaurant: DEMO_RESTAURANTS[0],
    settings: DEMO_SETTINGS[DEMO_RESTAURANTS[0].id],
    customerName: 'Rahul Sharma',
    customerPhone: '+91 9876543210',
    items: sampleItems,
    appBaseUrl: 'https://quick-bite-demo.vercel.app',
  });

  console.log(`  Generated WhatsApp URL:\n  ${billUrl}`);
  if (!billUrl.startsWith('https://wa.me/919876543210?text=')) {
    throw new Error(`Invalid WhatsApp URL phone prefix: ${billUrl}`);
  }
  const decodedMessage = decodeURIComponent(billUrl.split('?text=')[1]);
  console.log(`\n  Decoded Message Content:\n${decodedMessage}\n`);

  if (!decodedMessage.includes('Rahul Sharma') || !decodedMessage.includes('Burger') || !decodedMessage.includes('₹273')) {
    throw new Error('Missing customer name, burger, or total in decoded WhatsApp receipt message');
  }
  console.log('  ✓ Test 3 Passed: Dynamic WhatsApp receipt generated with emoji and items!\n');

  // TEST 4: Birthday Greeting WhatsApp URL Generation
  console.log('[TEST 4] Testing WhatsApp Birthday Greeting URL:');
  const bdayUrl = buildBirthdayWhatsAppUrl({
    customerName: 'Pooja Patel',
    customerPhone: '+919812345678',
    daysRemaining: 7,
    restaurant: DEMO_RESTAURANTS[0],
    settings: DEMO_SETTINGS[DEMO_RESTAURANTS[0].id],
  });

  console.log(`  Generated Birthday Greeting URL:\n  ${bdayUrl}`);
  const decodedBdayMessage = decodeURIComponent(bdayUrl.split('?text=')[1]);
  console.log(`\n  Decoded Birthday Message Content:\n${decodedBdayMessage}\n`);

  if (!decodedBdayMessage.includes('Pooja Patel') || !decodedBdayMessage.includes('7 days') || !decodedBdayMessage.includes('Chocolate Lava Cake')) {
    throw new Error('Missing customer name, reminder window, or offer in decoded WhatsApp greeting');
  }
  console.log('  ✓ Test 4 Passed: Dynamic WhatsApp birthday greeting generated!\n');

  // TEST 5: Multi-Tenant Data Isolation Check
  console.log('[TEST 5] Testing Multi-Tenant Restaurant Data Partitioning:');
  const restA = DEMO_RESTAURANTS[0]; // Quick Bite Cafe
  const restB = DEMO_RESTAURANTS[1]; // Urban Brew Co.

  console.log(`  Restaurant A: ${restA.name} (id: ${restA.id}, slug: ${restA.slug})`);
  console.log(`  Restaurant B: ${restB.name} (id: ${restB.id}, slug: ${restB.slug})`);

  if (restA.id === restB.id || restA.slug === restB.slug) {
    throw new Error('Restaurant IDs or slugs overlap! Multi-tenancy violation.');
  }

  const settingsA = DEMO_SETTINGS[restA.id];
  const settingsB = DEMO_SETTINGS[restB.id];
  if (settingsA.birthday_offer_text === settingsB.birthday_offer_text) {
    throw new Error('Restaurant settings overlap!');
  }
  console.log('  ✓ Test 5 Passed: Restaurants and settings cleanly partitioned!\n');

  console.log('🎉 ALL 5 LOGICAL FLOW VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
}

runVerificationTests();
