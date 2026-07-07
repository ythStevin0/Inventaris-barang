<?php

namespace App\Notifications;

use App\Channels\WhatsAppChannel;
use App\Models\Borrowing;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BorrowingStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Borrowing $borrowing;
    protected string $action;

    /**
     * Create a new notification instance.
     *
     * @param Borrowing $borrowing
     * @param string $action 'created', 'approved', 'rejected', 'return_requested', 'returned'
     */
    public function __construct(Borrowing $borrowing, string $action)
    {
        $this->borrowing = $borrowing;
        $this->action = $action;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        // Kirim via email (bawaan Laravel) dan WhatsApp (channel buatan kita)
        return ['mail', WhatsAppChannel::class];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $message = (new MailMessage)
                    ->subject($this->getSubject())
                    ->greeting("Halo, {$notifiable->name}!");

        $lines = explode("\n", $this->getMessageContent());
        foreach ($lines as $line) {
            if (trim($line) !== '') {
                $message->line($line);
            }
        }

        return $message;
    }

    /**
     * Get the WhatsApp representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return string
     */
    public function toWhatsApp($notifiable)
    {
        return "Halo *{$notifiable->name}*,\n\n" . $this->getMessageContent() . "\n\n_Ini adalah pesan otomatis dari Sistem Informasi Inventaris._";
    }

    /**
     * Menyusun subject email
     */
    protected function getSubject(): string
    {
        switch ($this->action) {
            case 'created':
                return 'Pengajuan Peminjaman Diterima';
            case 'approved':
                return 'Peminjaman Disetujui';
            case 'rejected':
                return 'Peminjaman Ditolak';
            case 'return_requested':
                return 'Pengajuan Pengembalian Diproses';
            case 'returned':
                return 'Pengembalian Selesai';
            default:
                return 'Pemberitahuan Peminjaman Barang';
        }
    }

    /**
     * Menyusun isi konten pesan (berlaku untuk Email dan WA)
     */
    protected function getMessageContent(): string
    {
        $items = '';
        foreach ($this->borrowing->borrowingItems as $bItem) {
            $items .= "- {$bItem->item->name} ({$bItem->quantity} unit)\n";
        }

        switch ($this->action) {
            case 'created':
                return "Pengajuan peminjaman barang Anda telah kami terima dan sedang menunggu persetujuan dari Admin/Pengurus.\n\n*Detail Peminjaman:*\n" . $items . "\nTanggal Pinjam: " . $this->borrowing->borrow_date . "\nTenggat Kembali: " . $this->borrowing->due_date;
            
            case 'approved':
                return "Kabar baik! Pengajuan peminjaman barang Anda telah *DISETUJUI*.\n\n*Barang yang dipinjam:*\n" . $items . "\nSilakan ambil barang di ruang inventaris. Jangan lupa kembalikan tepat waktu pada: " . $this->borrowing->due_date;
            
            case 'rejected':
                $notes = $this->borrowing->notes ? "\nAlasan: " . $this->borrowing->notes : "";
                return "Mohon maaf, pengajuan peminjaman barang Anda *DITOLAK* oleh pengurus." . $notes . "\n\n*Barang yang diajukan:*\n" . $items;
            
            case 'return_requested':
                return "Anda telah mengajukan pengembalian barang. Silakan serahkan barang fisik ke Admin/Pengurus untuk dilakukan pengecekan kondisi.\n\n*Barang yang dikembalikan:*\n" . $items;
            
            case 'returned':
                $fineMsg = $this->borrowing->total_fine > 0 
                    ? "\n⚠️ *Terdapat Denda Keterlambatan/Kerusakan sebesar: Rp " . number_format((float) $this->borrowing->total_fine, 0, ',', '.') . "*" 
                    : "";
                return "Terima kasih! Pengembalian barang Anda telah berhasil diverifikasi dan diselesaikan." . $fineMsg . "\n\n*Barang yang dikembalikan:*\n" . $items;
            
            default:
                return "Terdapat update pada transaksi peminjaman Anda.";
        }
    }
}
