<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBorrowingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Otomatis isi borrower_name dari nama user yang login jika tidak dikirim
        if (! $this->filled('borrower_name') && $this->user()) {
            $this->merge([
                'borrower_name' => $this->user()->name,
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'borrower_name'       => ['required', 'string', 'max:255'],
            'borrow_date'         => ['required', 'date', 'after_or_equal:today'],
            'due_date'            => ['required', 'date', 'after:borrow_date'],
            'purpose'             => ['required', 'string', 'max:1000'],
            'notes'               => ['nullable', 'string', 'max:1000'],
            'items'               => ['required', 'array', 'min:1'],
            'items.*.item_id'     => ['required', 'integer', 'exists:items,id'],
            'items.*.quantity'    => ['required', 'integer', 'min:1'],
            'items.*.notes'       => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'borrow_date.after_or_equal' => 'Tanggal pinjam tidak boleh di masa lalu.',
            'due_date.after'             => 'Tanggal tenggat kembali harus setelah tanggal pinjam.',
            'items.required'             => 'Minimal harus memilih 1 barang untuk dipinjam.',
            'items.min'                  => 'Minimal harus memilih 1 barang untuk dipinjam.',
            'items.*.item_id.exists'     => 'Barang yang dipilih tidak ditemukan.',
            'items.*.quantity.min'       => 'Jumlah pinjam minimal 1.',
        ];
    }
}
