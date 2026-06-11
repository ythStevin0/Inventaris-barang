<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateItemRequest extends FormRequest
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
        $itemCode = $this->input('item_code');

        $this->merge([
            'item_code' => is_string($itemCode) ? strtoupper(trim($itemCode)) : $itemCode,
            'type' => is_string($this->input('type')) ? strtolower(trim($this->input('type'))) : $this->input('type'),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $item = $this->route('item');

        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'item_code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('items', 'item_code')->ignore($item),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'in:durable,consumable'],
            'unit' => ['required', 'string', 'max:100'],
            'stock_total' => ['required', 'integer', 'min:0'],
            'stock_available' => ['nullable', 'integer', 'min:0'],
            'stock_damaged' => ['nullable', 'integer', 'min:0'],
            'location' => ['nullable', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
