<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationSetting extends Model
{
    protected $guarded = [];
    protected $table = 'notification_settings';

    // Setting keys
    const KEY_NEW_APPLICATION = 'telegram_new_application';
    const KEY_STATUS_CHANGE = 'telegram_status_change';

    /**
     * Check if a notification setting is enabled
     *
     * @param string $key
     * @return bool
     */
    public static function isEnabled($key)
    {
        $setting = self::where('setting_key', $key)->first();
        return $setting ? (bool) $setting->setting_value : false;
    }

    /**
     * Check if status change notification is enabled
     *
     * @return bool
     */
    public static function isStatusChangeNotificationEnabled()
    {
        return self::isEnabled(self::KEY_STATUS_CHANGE);
    }
}
