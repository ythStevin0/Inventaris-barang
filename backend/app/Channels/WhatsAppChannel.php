<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use App\Services\WhatsAppService;
use Illuminate\Support\Facades\Log;

class WhatsAppChannel
{
    /**
     * Send the given notification.
     *
     * @param  mixed  $notifiable
     * @param  Notification  $notification
     * @return void
     */
    public function send($notifiable, Notification $notification)
    {
        Log::info('[WhatsAppChannel] send() dipanggil untuk user: ' . ($notifiable->name ?? 'unknown'));
        
        if (! method_exists($notification, 'toWhatsApp')) {
            Log::warning('[WhatsAppChannel] Notification tidak punya method toWhatsApp');
            return;
        }

        $message = $notification->toWhatsApp($notifiable);

        if (empty($message)) {
            Log::warning('[WhatsAppChannel] Pesan kosong, tidak dikirim');
            return;
        }

        // Dapatkan nomor HP user. (Asumsi di model User sudah ada field 'no_hp')
        // Pastikan field-nya sesuai. Misalnya: $notifiable->no_hp
        $phoneNumber = $notifiable->no_hp ?? null;

        Log::info('[WhatsAppChannel] no_hp user: ' . ($phoneNumber ?? 'NULL'));

        if ($phoneNumber) {
            WhatsAppService::sendMessage($phoneNumber, $message);
        } else {
            Log::warning('[WhatsAppChannel] no_hp kosong, WhatsApp tidak dikirim');
        }
    }
}
