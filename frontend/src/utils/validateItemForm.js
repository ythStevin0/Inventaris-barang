export function validateItemForm(form) {
  const { stock_total, stock_available, stock_damaged } = form;

  if (stock_total < 0 || stock_available < 0 || stock_damaged < 0) {
    return 'Nilai stok tidak boleh kurang dari 0.';
  }

  if (stock_available > stock_total) {
    return 'Stok tersedia tidak boleh melebihi stok total.';
  }

  if (stock_damaged > stock_total) {
    return 'Stok rusak tidak boleh melebihi stok total.';
  }

  if (stock_available + stock_damaged > stock_total) {
    return 'Stok tersedia ditambah stok rusak tidak boleh melebihi stok total.';
  }

  return '';
}
