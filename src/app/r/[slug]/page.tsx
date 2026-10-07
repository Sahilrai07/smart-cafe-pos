import React from 'react';
import { MenuOrderingView } from '@/components/customer/MenuOrderingView';

export default async function RestaurantMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ table?: string; t?: string }>;
}) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const table = sp?.table || sp?.t;
  return <MenuOrderingView slug={slug} tableNumber={table} />;
}

