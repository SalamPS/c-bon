import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { validators, createErrorResponse } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(request.cookies);

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { errorStatusText: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    
    try {
      const status = validators.statusQuery(searchParams.get('status'));
      const type = validators.typeQuery(searchParams.get('type'));

      let query = supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: false });

      // Apply filters
      if (status === 'belum') {
        query = query.is('settled_at', null);
      } else if (status === 'lunas') {
        query = query.not('settled_at', 'is', null);
      }

      if (type && type !== 'semua') {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json(
          { errorStatusText: 'Gagal mengambil data' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data });
    } catch (error) {
      const { status, body } = createErrorResponse(error);
      return NextResponse.json(body, { status });
    }
  } catch {
    return NextResponse.json(
      { errorStatusText: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(request.cookies);

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { errorStatusText: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { errorStatusText: 'Request body tidak valid (JSON parsing error)' },
        { status: 400 }
      );
    }

    // Validate input using validation schema
    try {
      if (!body || typeof body !== 'object') {
        throw new Error('Request body tidak valid');
      }

      const data = body as Record<string, unknown>;
      const type = validators.debtType(data.type);
      const counterpart_name = validators.counterpartName(data.counterpart_name);
      const amount = validators.amount(data.amount);
      const note = validators.note(data.note);
      const created_at = validators.createdAt(data.created_at);
      const due_date = validators.dueDate(data.due_date);

      const { data: insertedData, error } = await supabase
        .from('debts')
        .insert({
          user_id: user.id,
          type,
          counterpart_name,
          amount,
          note,
          created_at,
          due_date,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { errorStatusText: 'Gagal membuat entry' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: insertedData }, { status: 201 });
    } catch (error) {
      const { status, body: errorBody } = createErrorResponse(error);
      return NextResponse.json(errorBody, { status });
    }
  } catch {
    return NextResponse.json(
      { errorStatusText: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
