<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    protected $botToken;
    protected $chatId;
    protected $client;

    public function __construct()
    {
        $this->botToken = env('TELEGRAM_BOT_TOKEN');
        $this->chatId = env('TELEGRAM_CHAT_ID');
        $this->client = new Client();
    }

    /**
     * Send a message to Telegram
     *
     * @param string $message
     * @return array|null
     */
    public function sendMessage($message)
    {
        if (empty($this->botToken) || empty($this->chatId)) {
            Log::warning('Telegram credentials not configured');
            return null;
        }

        try {
            $url = "https://api.telegram.org/bot{$this->botToken}/sendMessage";

            $response = $this->client->post($url, [
                'form_params' => [
                    'chat_id' => $this->chatId,
                    'text' => $message,
                    'parse_mode' => 'HTML',
                ]
            ]);

            return json_decode($response->getBody(), true);
        } catch (\Exception $e) {
            Log::error('Telegram notification failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Send job application notification
     *
     * @param array $data
     * @return array|null
     */
    public function sendJobApplicationNotification($data)
    {
        $message = "🔔 <b>New Job Application Received</b>\n\n";
        $message .= "👤 <b>Name:</b> " . ($data['name'] ?? 'N/A') . "\n";
        $message .= "📧 <b>Email:</b> " . ($data['email'] ?? 'N/A') . "\n";
        $message .= "📱 <b>Mobile:</b> " . ($data['countrycode'] ?? '') . " " . ($data['mobile'] ?? 'N/A') . "\n";
        $message .= "💼 <b>Job Category:</b> " . ($data['category_name'] ?? 'N/A') . "\n";
        $message .= "🎓 <b>Qualification:</b> " . ($data['qualification'] ?? 'N/A') . "\n";
        $message .= "📅 <b>Experience:</b> " . ($data['experience'] ?? 'N/A');

        if (!empty($data['experience_years'])) {
            $message .= " (" . $data['experience_years'] . " years)";
        }

        $message .= "\n💰 <b>Expected Salary:</b> " . ($data['expected_salary'] ?? 'N/A') . "\n";
        $message .= "\n📍 <b>Location:</b> " . ($data['district'] ?? '') . ", " . ($data['state'] ?? '') . "\n";
        $message .= "\n⏰ <b>Applied At:</b> " . now()->format('d-m-Y h:i A');

        return $this->sendMessage($message);
    }
}
