import { DebtType, DebtInput } from './types';

export class ValidationError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// Field Validators
// ============================================================================

export const validators = {
  // Validates debt type
  debtType: (value: unknown): DebtType => {
    if (!value || !['owed_to_me', 'i_owe'].includes(String(value))) {
      throw new ValidationError(
        400,
        'Tipe hutang tidak valid. Gunakan "owed_to_me" atau "i_owe"'
      );
    }
    return value as DebtType;
  },

  // Validates counterpart name
  counterpartName: (value: unknown): string => {
    if (!value || typeof value !== 'string') {
      throw new ValidationError(400, 'Nama orang diperlukan');
    }
    
    const trimmed = value.trim();
    
    if (trimmed.length === 0) {
      throw new ValidationError(400, 'Nama orang tidak boleh kosong');
    }
    
    if (trimmed.length > 100) {
      throw new ValidationError(400, 'Nama orang maksimal 100 karakter');
    }

    // Check for invalid characters
    if (!/^[a-zA-Z0-9\s\.\-\,\(\)ñáéíóúàèìòùäöüÑÁÉÍÓÚÀÈÌÒÙÄÖÜ]+$/.test(trimmed)) {
      throw new ValidationError(
        400,
        'Nama orang mengandung karakter yang tidak valid'
      );
    }
    
    return trimmed;
  },

  // Validates amount
  amount: (value: unknown): number => {
    if (value === null || value === undefined) {
      throw new ValidationError(400, 'Jumlah hutang diperlukan');
    }

    let num: number;

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!/^\d+$/.test(trimmed)) {
        throw new ValidationError(
          400,
          'Jumlah hutang harus berupa angka bulat Rupiah tanpa desimal'
        );
      }
      num = Number(trimmed);
    } else {
      num = Number(value);
    }

    if (!Number.isFinite(num)) {
      throw new ValidationError(400, 'Jumlah hutang harus berupa angka');
    }

    if (!Number.isInteger(num)) {
      throw new ValidationError(
        400,
        'Jumlah hutang harus berupa angka bulat Rupiah tanpa desimal'
      );
    }

    if (num <= 0) {
      throw new ValidationError(400, 'Jumlah hutang harus lebih dari 0');
    }

    if (num > 999999999999) {
      throw new ValidationError(400, 'Jumlah hutang terlalu besar');
    }

    return num;
  },

  // Validates note
  note: (value: unknown): string | null => {
    if (!value) {
      return null;
    }

    if (typeof value !== 'string') {
      throw new ValidationError(400, 'Catatan harus berupa teks');
    }

    const trimmed = value.trim();

    if (trimmed.length === 0) {
      return null;
    }

    if (trimmed.length > 200) {
      throw new ValidationError(400, 'Catatan maksimal 200 karakter');
    }

    return trimmed;
  },

  // Validates debt date/timestamp for created_at (accepts YYYY-MM-DD or ISO datetime)
  createdAt: (value: unknown): string => {
    if (!value) {
      throw new ValidationError(400, 'Tanggal hutang diperlukan');
    }

    if (typeof value !== 'string') {
      throw new ValidationError(400, 'Tanggal hutang harus berupa teks');
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError(400, 'Tanggal hutang tidak valid');
    }

    const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
    const isoDateTimeRegex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

    if (!dateOnlyRegex.test(value) && !isoDateTimeRegex.test(value)) {
      throw new ValidationError(
        400,
        'Format tanggal hutang tidak valid. Gunakan YYYY-MM-DD atau ISO datetime'
      );
    }

    return value;
  },

  // Validates due date format (nullable, YYYY-MM-DD)
  dueDate: (value: unknown): string | null => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (typeof value !== 'string') {
      throw new ValidationError(400, 'Tanggal jatuh tempo harus berupa teks');
    }

    // Check valid ISO date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      throw new ValidationError(
        400,
        'Format tanggal tidak valid. Gunakan YYYY-MM-DD'
      );
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError(400, 'Tanggal tidak valid');
    }

    // Check if date is not too far in the future (max 1 year ahead)
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
    
    if (date > maxFutureDate) {
      throw new ValidationError(
        400,
        'Tanggal jatuh tempo tidak boleh lebih dari satu tahun ke depan'
      );
    }

    return value;
  },

  // Validates settled date (nullable)
  settledAt: (value: unknown): string | null => {
    if (!value) {
      return null;
    }

    if (typeof value !== 'string') {
      throw new ValidationError(400, 'Tanggal pelunasan harus berupa teks');
    }

    // Check valid ISO date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      throw new ValidationError(
        400,
        'Format tanggal pelunasan tidak valid. Gunakan YYYY-MM-DD'
      );
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError(400, 'Tanggal pelunasan tidak valid');
    }

    return value;
  },

  // Validates ID format (UUID v4)
  id: (value: unknown): string => {
    if (!value || typeof value !== 'string') {
      throw new ValidationError(400, 'ID tidak valid');
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(value)) {
      throw new ValidationError(400, 'Format ID tidak valid');
    }

    return value;
  },

  // Validates query status parameter
  statusQuery: (value: unknown): string | null => {
    if (!value) {
      return null;
    }

    const status = String(value);
    if (!['semua', 'belum', 'lunas'].includes(status)) {
      throw new ValidationError(
        400,
        'Status tidak valid. Gunakan "semua", "belum", atau "lunas"'
      );
    }

    return status;
  },

  // Validates query type parameter
  typeQuery: (value: unknown): string | null => {
    if (!value) {
      return null;
    }

    const type = String(value);
    if (!['semua', 'owed_to_me', 'i_owe'].includes(type)) {
      throw new ValidationError(
        400,
        'Tipe tidak valid. Gunakan "semua", "owed_to_me", atau "i_owe"'
      );
    }

    return type;
  },
};

// ============================================================================
// Input Schema Validators
// ============================================================================

export const validateCreateDebtInput = (body: unknown): DebtInput => {
  if (!body || typeof body !== 'object') {
    throw new ValidationError(400, 'Request body tidak valid');
  }

  const data = body as Record<string, unknown>;

  return {
    type: validators.debtType(data.type),
    counterpart_name: validators.counterpartName(data.counterpart_name),
    amount: validators.amount(data.amount),
    note: validators.note(data.note),
    created_at: validators.createdAt(data.created_at),
    due_date: validators.dueDate(data.due_date),
  };
};

interface UpdateDebtInput {
  type?: DebtType;
  counterpart_name?: string;
  amount?: number;
  note?: string | null;
  created_at?: string;
  due_date?: string | null;
  settled_at?: string | null;
}

export const validateUpdateDebtInput = (body: unknown): UpdateDebtInput => {
  if (!body || typeof body !== 'object') {
    throw new ValidationError(400, 'Request body tidak valid');
  }

  const data = body as Record<string, unknown>;
  const result: UpdateDebtInput = {};

  // Validate each field only if it's provided
  if (data.type !== undefined) {
    result.type = validators.debtType(data.type);
  }

  if (data.counterpart_name !== undefined) {
    result.counterpart_name = validators.counterpartName(data.counterpart_name);
  }

  if (data.amount !== undefined) {
    result.amount = validators.amount(data.amount);
  }

  if (data.note !== undefined) {
    result.note = validators.note(data.note);
  }

  if (data.created_at !== undefined) {
    result.created_at = validators.createdAt(data.created_at);
  }

  if (data.due_date !== undefined) {
    result.due_date = validators.dueDate(data.due_date);
  }

  if (data.settled_at !== undefined) {
    result.settled_at = validators.settledAt(data.settled_at);
  }

  // Ensure at least one field is being updated
  if (Object.keys(result).length === 0) {
    throw new ValidationError(400, 'Tidak ada field yang diubah');
  }

  return result;
};

// ============================================================================
// Helper to create error response
// ============================================================================

export const createErrorResponse = (error: unknown) => {
  if (error instanceof ValidationError) {
    return {
      status: error.statusCode,
      body: { errorStatusText: error.message },
    };
  }

  return {
    status: 500,
    body: { errorStatusText: 'Terjadi kesalahan server' },
  };
};
