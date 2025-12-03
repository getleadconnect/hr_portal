<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmployeeDocument;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Validator;
use Carbon\Carbon;

class EmployeeDocumentController extends Controller
{
    /**
     * Get all documents for an employee
     */
    public function index($employeeId)
    {
        $employee = Employee::find($employeeId);

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found'
            ], 404);
        }

        $documents = EmployeeDocument::where('employee_id', $employeeId)
            ->orderBy('created_at', 'DESC')
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'document_name' => $doc->document_name,
                    'file_name' => $doc->file_name,
                    'file_url' => config('constants.file_path') . $doc->file_path,
                    'file_type' => $doc->file_type,
                    'file_size' => $doc->formatted_file_size,
                    'uploaded_at' => Carbon::parse($doc->created_at)->format('M d, Y'),
                    'created_at' => $doc->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $documents
        ]);
    }

    /**
     * Upload a new document
     */
    public function store(Request $request, $employeeId)
    {
        $employee = Employee::find($employeeId);

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'document_name' => 'required|string|max:255',
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = 'Resume-Getlead/employees/documents/' . $employeeId . '/' . $fileName;

            Storage::disk('spaces')->put($filePath, file_get_contents($file), 'public');

            $document = EmployeeDocument::create([
                'employee_id' => $employeeId,
                'document_name' => $request->document_name,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
                'uploaded_by' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'data' => [
                    'id' => $document->id,
                    'document_name' => $document->document_name,
                    'file_name' => $document->file_name,
                    'file_url' => config('constants.file_path') . $document->file_path,
                    'file_type' => $document->file_type,
                    'file_size' => $document->formatted_file_size,
                    'uploaded_at' => Carbon::parse($document->created_at)->format('M d, Y'),
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a document
     */
    public function destroy($employeeId, $documentId)
    {
        try {
            $document = EmployeeDocument::where('employee_id', $employeeId)
                ->where('id', $documentId)
                ->first();

            if (!$document) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document not found'
                ], 404);
            }

            // Delete file from storage
            if ($document->file_path) {
                Storage::disk('spaces')->delete($document->file_path);
            }

            $document->delete();

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
