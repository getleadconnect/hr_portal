<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\NotificationSetting;

class NotificationSettingController extends Controller
{
    /**
     * Get all notification settings
     */
    public function index()
    {
        try {
            $settings = NotificationSetting::all();

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a notification setting
     */
    public function update(Request $request, $id)
    {
        try {
            $setting = NotificationSetting::find($id);

            if (!$setting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Setting not found'
                ], 404);
            }

            $setting->update([
                'setting_value' => $request->setting_value ? 1 : 0
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Setting updated successfully',
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle a notification setting by key
     */
    public function toggle(Request $request)
    {
        try {
            $setting = NotificationSetting::where('setting_key', $request->setting_key)->first();

            if (!$setting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Setting not found'
                ], 404);
            }

            $newValue = $setting->setting_value ? 0 : 1;
            $setting->update(['setting_value' => $newValue]);

            return response()->json([
                'success' => true,
                'message' => 'Setting toggled successfully',
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
