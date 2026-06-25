import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { Debt } from '@/lib/types';
import { validators, createErrorResponse } from '@/lib/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validate ID format
    try {
      validators.id(id);
    } catch (error) {
      const { status, body } = createErrorResponse(error);
      return NextResponse.json(body, { status });
    }

    // Verify ownership before parsing body
    const { data: existingDebt, error: fetchError } = await supabase
      .from('debts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingDebt || existingDebt.user_id !== user.id) {
      return NextResponse.json(
        { errorStatusText: 'Entry tidak ditemukan atau Anda tidak memiliki akses' },
        { status: 404 }
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
      const updateData: Partial<Debt> = {};

      // Validate each field only if it's provided
      if (data.type !== undefined) {
        updateData.type = validators.debtType(data.type);
      }

      if (data.counterpart_name !== undefined) {
        updateData.counterpart_name = validators.counterpartName(data.counterpart_name);
      }

      if (data.amount !== undefined) {
        updateData.amount = validators.amount(data.amount);
      }

      if (data.note !== undefined) {
        updateData.note = validators.note(data.note);
      }

      if (data.created_at !== undefined) {
        updateData.created_at = validators.createdAt(data.created_at);
      }

      if (data.due_date !== undefined) {
        updateData.due_date = validators.dueDate(data.due_date);
      }

      if (data.settled_at !== undefined) {
        updateData.settled_at = validators.settledAt(data.settled_at);
      }

      // Ensure at least one field is being updated
      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { errorStatusText: 'Tidak ada field yang diubah' },
          { status: 400 }
        );
      }

      updateData.updated_at = new Date().toISOString();

      const { data: updatedData, error } = await supabase
        .from('debts')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { errorStatusText: 'Gagal mengupdate entry' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: updatedData });
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


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validate ID format
    try {
      validators.id(id);
    } catch (error) {
      const { status, body } = createErrorResponse(error);
      return NextResponse.json(body, { status });
    }

    // Verify ownership
    const { data: existingDebt, error: fetchError } = await supabase
      .from('debts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingDebt || existingDebt.user_id !== user.id) {
      return NextResponse.json(
        { errorStatusText: 'Entry tidak ditemukan atau Anda tidak memiliki akses' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        { errorStatusText: 'Gagal menghapus entry' },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { errorStatusText: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
