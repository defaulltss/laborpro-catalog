import { NextRequest, NextResponse } from 'next/server';
import { getAllVisibilityStates, setProductVisibility } from '@/lib/db';

export async function GET() {
  try {
    const states = await getAllVisibilityStates();
    const obj: Record<number, boolean> = {};
    for (const [id, visible] of states) {
      obj[id] = visible;
    }
    return NextResponse.json(obj);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch visibility states' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { productId, visible } = await request.json();

    if (typeof productId !== 'number' || typeof visible !== 'boolean') {
      return NextResponse.json(
        { error: 'productId (number) and visible (boolean) are required' },
        { status: 400 }
      );
    }

    await setProductVisibility(productId, visible);
    return NextResponse.json({ success: true, productId, visible });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update visibility' },
      { status: 500 }
    );
  }
}
