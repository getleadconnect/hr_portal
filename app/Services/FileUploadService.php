<?php
namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class FileUploadService
{
    /**
     * Upload a file to a given disk and folder.
     *
     * @param  UploadedFile $file
     * @param  string $folder
     * @param  string $disk
     * @return string File path
     */
    public function uploadFile(UploadedFile $file, $folder = 'uploads',$filename, $disk = 'public')
    {
        // Store the file
        $path = $file->storeAs($folder, $filename, $disk);

        return $path;
    }

    /**
     * Delete a file from a given disk.
     *
     * @param  string $path
     * @param  string $disk
     * @return bool
     */
    public function deleteFile($path, $disk = 'local')
    {
        return Storage::disk($disk)->delete($path);
    }

    /**
     * view a file from a given disk.
     *
     * @param  string $path
     * @param  string $disk
     * @return bool
     */
    //public function viewFile($path, $disk = 'public')
	public function viewFile($path, $disk = 'local')
    {
        return Storage::disk($disk)->url($path);
    }
}
