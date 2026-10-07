import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase/server';
import { DEMO_MENU_ITEMS, DEMO_SETTINGS } from '@/lib/demoData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      restaurant_id,
      table_id,
      table_number,
      items,
      special_instructions,
      customer_name,
      customer_phone,
    } = body;

    // 1. Basic validation
    if (!restaurant_id) {
      return NextResponse.json(
        { error: 'Missing restaurant_id' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    const client = getServerSupabaseClient();

    // ------------------------------------------------------------------------
    // FALLBACK IF SUPABASE IS NOT CONFIGURED
    // ------------------------------------------------------------------------
    if (!client) {
      console.warn('[API /api/orders] Supabase not configured. Using local store fallback.');
      const menuItems = DEMO_MENU_ITEMS.filter((m) => m.restaurant_id === restaurant_id);
      const settings = DEMO_SETTINGS[restaurant_id] || { tax_enabled: true, tax_percentage: 5.0 };

      let subtotal = 0;
      const orderItems = [];

      for (const itemReq of items) {
        const found = menuItems.find((m) => m.id === itemReq.menu_item_id);
        if (!found) continue;
        const qty = Math.max(1, parseInt(itemReq.quantity, 10) || 1);
        const itemTotal = found.price * qty;
        subtotal += itemTotal;
        orderItems.push({
          menu_item_id: found.id,
          item_name_snapshot: found.name,
          quantity: qty,
          unit_price_snapshot: found.price,
          total: itemTotal,
        });
      }

      const tax = settings.tax_enabled ? Number(((subtotal * (settings.tax_percentage || 5)) / 100).toFixed(2)) : 0;
      const total = Number((subtotal + tax).toFixed(2));

      const newOrder = {
        id: `ord-${Date.now()}`,
        restaurant_id,
        table_id: table_id || null,
        table_number_snapshot: table_number || (body.order_type === 'PICKUP' ? 'Pickup Counter' : 'Takeaway'),
        customer_name: customer_name || null,
        customer_phone: customer_phone || null,
        order_number: Math.floor(1000 + Math.random() * 9000),
        status: 'NEW',
        order_type: body.order_type || 'DINE_IN',
        subtotal,
        tax,
        discount: 0,
        total,
        special_instructions: special_instructions || null,
        prep_time_minutes: 15,
        estimated_ready_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        pickup_token: body.order_type === 'PICKUP' ? `TK-${Math.floor(10 + Math.random() * 89)}` : undefined,
        items: orderItems,
        created_at: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
    }

    // ------------------------------------------------------------------------
    // REAL SUPABASE BACKEND EXECUTION WITH SERVER-TRUSTED PRICING
    // ------------------------------------------------------------------------

    // Step 1: Validate restaurant exists
    const { data: restaurant, error: restErr } = await client
      .from('restaurants')
      .select('id, name')
      .eq('id', restaurant_id)
      .maybeSingle();

    if (restErr || !restaurant) {
      return NextResponse.json(
        { error: `Restaurant not found: ${restErr?.message || 'Invalid ID'}` },
        { status: 404 }
      );
    }

    // Step 2: Validate table if provided
    let verifiedTableId: string | null = null;
    let verifiedTableNumber = table_number || 'Takeaway';

    if (table_id) {
      const { data: tableData } = await client
        .from('tables')
        .select('id, table_number')
        .eq('id', table_id)
        .eq('restaurant_id', restaurant_id)
        .maybeSingle();

      if (tableData) {
        verifiedTableId = tableData.id;
        verifiedTableNumber = tableData.table_number;
      }
    } else if (table_number) {
      const { data: tableData } = await client
        .from('tables')
        .select('id, table_number')
        .eq('restaurant_id', restaurant_id)
        .or(`table_number.eq.${table_number},qr_slug.eq.${table_number}`)
        .maybeSingle();

      if (tableData) {
        verifiedTableId = tableData.id;
        verifiedTableNumber = tableData.table_number;
      }
    }

    // Step 3: Fetch CURRENT trusted menu item prices from Supabase
    const requestedItemIds = items.map((i: any) => i.menu_item_id).filter(Boolean);
    const { data: dbMenuItems, error: menuErr } = await client
      .from('menu_items')
      .select('id, name, price, available')
      .eq('restaurant_id', restaurant_id)
      .in('id', requestedItemIds);

    if (menuErr || !dbMenuItems) {
      return NextResponse.json(
        { error: 'Failed to fetch menu items from database' },
        { status: 500 }
      );
    }

    const menuMap = new Map<string, { id: string; name: string; price: number; available: boolean }>();
    dbMenuItems.forEach((item) => menuMap.set(item.id, item));

    // Step 4: Calculate subtotal using SERVER-TRUSTED prices
    let calculatedSubtotal = 0;
    const verifiedOrderItems: Array<{
      menu_item_id: string;
      item_name_snapshot: string;
      quantity: number;
      unit_price_snapshot: number;
      total: number;
    }> = [];

    for (const requestedItem of items) {
      const dbItem = menuMap.get(requestedItem.menu_item_id);
      if (!dbItem) {
        return NextResponse.json(
          { error: `Item ${requestedItem.menu_item_id} does not exist in this restaurant` },
          { status: 400 }
        );
      }
      if (!dbItem.available) {
        return NextResponse.json(
          { error: `Item "${dbItem.name}" is currently unavailable` },
          { status: 400 }
        );
      }

      const qty = Math.max(1, parseInt(requestedItem.quantity, 10) || 1);
      const unitPrice = Number(dbItem.price);
      const lineTotal = Number((unitPrice * qty).toFixed(2));
      calculatedSubtotal = Number((calculatedSubtotal + lineTotal).toFixed(2));

      verifiedOrderItems.push({
        menu_item_id: dbItem.id,
        item_name_snapshot: dbItem.name,
        quantity: qty,
        unit_price_snapshot: unitPrice,
        total: lineTotal,
      });
    }

    // Step 5: Read tax configuration from restaurant_settings
    const { data: settings } = await client
      .from('restaurant_settings')
      .select('tax_enabled, tax_percentage')
      .eq('restaurant_id', restaurant_id)
      .maybeSingle();

    const taxPercentage = settings?.tax_percentage ?? 5.0;
    const taxEnabled = settings?.tax_enabled ?? true;
    const calculatedTax = taxEnabled ? Number(((calculatedSubtotal * taxPercentage) / 100).toFixed(2)) : 0.0;
    const calculatedTotal = Number((calculatedSubtotal + calculatedTax).toFixed(2));

    // Step 6: Insert into public.orders
    const orderInsertPayload = {
      restaurant_id,
      table_id: verifiedTableId,
      table_number_snapshot: verifiedTableNumber,
      customer_name: customer_name || null,
      customer_phone: customer_phone || null,
      status: 'NEW',
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      discount: 0.0,
      total: calculatedTotal,
      special_instructions: special_instructions || null,
    };

    const { data: createdOrder, error: orderInsertErr } = await client
      .from('orders')
      .insert(orderInsertPayload)
      .select('*')
      .single();

    if (orderInsertErr || !createdOrder) {
      console.error('[API /api/orders] Order insert failed:', orderInsertErr);
      return NextResponse.json(
        { error: `Failed to insert order: ${orderInsertErr?.message}` },
        { status: 500 }
      );
    }

    // Step 7: Insert into public.order_items
    const orderItemsPayload = verifiedOrderItems.map((item) => ({
      order_id: createdOrder.id,
      menu_item_id: item.menu_item_id,
      item_name_snapshot: item.item_name_snapshot,
      quantity: item.quantity,
      unit_price_snapshot: item.unit_price_snapshot,
      total: item.total,
    }));

    const { data: insertedItems, error: itemsInsertErr } = await client
      .from('order_items')
      .insert(orderItemsPayload)
      .select('*');

    if (itemsInsertErr) {
      console.error('[API /api/orders] Order items insert failed:', itemsInsertErr);
      // Even if items insert encountered an issue, the order row exists
    }

    // Return the full real order with items
    const completeOrder = {
      ...createdOrder,
      items: insertedItems || verifiedOrderItems,
    };

    return NextResponse.json(
      {
        success: true,
        order: completeOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API /api/orders] Unexpected error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error processing order' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId parameter' },
        { status: 400 }
      );
    }

    const client = getServerSupabaseClient();
    if (client) {
      const { data, error } = await client
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', orderId)
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({
          success: true,
          order: data,
        });
      }
    }

    return NextResponse.json(
      { error: 'Order not found' },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

