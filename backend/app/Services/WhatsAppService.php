<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Mengirim pesan WhatsApp menggunakan API Fonnte.
     *
     * @param string $target Nomor HP tujuan (misal: 08123456789 atau 628123456789)
     * @param string $message Isi pesan
     * @return bool
     */
    public static function sendMessage(string $target, string $message): bool
    {
        Log::info("[WhatsApp] sendMessage() dipanggil untuk target: {$target}");
        
        $token = config('services.fonnte.token');
        
        // Jika token kosong (misal di local environment), log pesan saja
        if (empty($token)) {
            Log::info("[WhatsApp] SIMULASI (token kosong) ke {$target}: \n{$message}");
            return true;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->post('https://api.fonnte.com/send', [
                'target' => $target,
                'message' => $message,
                'countryCode' => '62', // Default Indonesia
            ]);

            if ($response->successful()) {
                Log::info("[WhatsApp] BERHASIL kirim ke {$target}", [
                    'response' => $response->body()
                ]);
                return true;
            }

            Log::error('Fonnte WhatsApp API failed:', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return false;

        } catch (\Exception $e) {
            Log::error('Fonnte WhatsApp API exception:', [
                'message' => $e->getMessage()
            ]);
            return false;
        }
    }
}
