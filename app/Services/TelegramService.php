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

    /**
     * Send application status change notification
     *
     * @param object $application
     * @param string $newStatus
     * @param string|null $reason
     * @return array|null
     */
    public function sendStatusChangeNotification($application, $newStatus, $reason = null)
    {
        $statusEmoji = $this->getStatusEmoji($newStatus);
        $statusLabel = $this->getStatusLabel($newStatus);

        $message = "{$statusEmoji} <b>Application Status Updated</b>\n\n";
        $message .= "📋 <b>Status:</b> {$statusLabel}\n";

        if (!empty($reason)) {
            $message .= "📝 <b>Reason:</b> {$reason}\n";
        }

        $message .= "━━━━━━━━━━━━━━━━━━\n";
        $message .= "👤 <b>Name:</b> " . ($application->name ?? 'N/A') . "\n";
        $message .= "📧 <b>Email:</b> " . ($application->email ?? 'N/A') . "\n";
        $message .= "📱 <b>Mobile:</b> " . ($application->countrycode ?? '') . ($application->mobile ?? 'N/A') . "\n";
        $message .= "💼 <b>Job Category:</b> " . ($application->category_name ?? 'N/A') . "\n";
        $message .= "🎓 <b>Qualification:</b> " . ($application->qualification ?? 'N/A') . "\n";
        $message .= "📅 <b>Experience:</b> " . ($application->experience ?? 'N/A');

        if (!empty($application->experience_years)) {
            $message .= " (" . $application->experience_years . " years)";
        }

        $message .= "\n💰 <b>Expected Salary:</b> " . ($application->expected_salary ?? 'N/A') . "\n";
        $message .= "━━━━━━━━━━━━━━━━━━\n";
        $message .= "⏰ <b>Updated At:</b> " . now()->format('d-m-Y h:i A');

        return $this->sendMessage($message);
    }

    /**
     * Get emoji based on status
     *
     * @param string $status
     * @return string
     */
    private function getStatusEmoji($status)
    {
        switch ($status) {
            case 'New':
                return '🆕';
            case 'Short Listed':
                return '📝';
            case 'Appointed':
                return '✅';
            case 'Rejected':
                return '❌';
            case 'Not Interested':
                return '🚫';
            case 'Not fit for this job':
                return '⛔';
            default:
                return '📌';
        }
    }

    /**
     * Get formatted status label
     *
     * @param string $status
     * @return string
     */
    private function getStatusLabel($status)
    {
        switch ($status) {
            case 'New':
                return '🔵 New';
            case 'Short Listed':
                return '🟡 Short Listed';
            case 'Appointed':
                return '🟢 Appointed';
            case 'Rejected':
                return '🔴 Rejected';
            case 'Not Interested':
                return '🟠 Not Interested';
            case 'Not fit for this job':
                return '🟣 Not fit for this job';
            default:
                return $status;
        }
    }
}
