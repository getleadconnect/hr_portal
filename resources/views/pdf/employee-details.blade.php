<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Employee Details - {{ $employee->full_name }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 15px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #2563eb;
        }
        .header p {
            margin: 5px 0 0 0;
            color: #666;
            font-size: 14px;
        }
        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        .section-title {
            background-color: #2563eb;
            color: white;
            padding: 8px 12px;
            margin-bottom: 15px;
            font-size: 14px;
            font-weight: bold;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .info-table td {
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-table td:first-child {
            font-weight: bold;
            width: 35%;
            color: #4b5563;
        }
        .info-table td:last-child {
            color: #1f2937;
        }
        .profile-image {
            text-align: center;
            margin: 20px 0;
        }
        .profile-image img {
            max-width: 150px;
            max-height: 150px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
        }
        .documents-grid {
            display: table;
            width: 100%;
            margin-top: 15px;
        }
        .document-item {
            display: table-cell;
            width: 50%;
            padding: 10px;
            vertical-align: top;
            text-align: center;
        }
        .document-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #4b5563;
        }
        .document-image {
            margin-top: 10px;
        }
        .document-image img {
            max-width: 100%;
            max-height: 200px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
        }
        .document-link {
            color: #2563eb;
            text-decoration: none;
            padding: 5px 10px;
            border: 1px solid #2563eb;
            border-radius: 4px;
            display: inline-block;
            margin-top: 10px;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
        }
        .badge-active {
            background-color: #10b981;
            color: white;
        }
        .badge-inactive {
            background-color: #6b7280;
            color: white;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Employee Details Report</h1>
        <p>Generated on {{ date('d-m-Y H:i:s') }}</p>
    </div>

    <!-- Profile Image -->
    @if($employee->profile_image_url)
    <div class="profile-image">
        <img src="{{ $employee->profile_image_url }}" alt="Profile Image">
    </div>
    @endif

    <!-- Personal Information -->
    <div class="section">
        <div class="section-title">Personal Information</div>
        <table class="info-table">
            <tr>
                <td>Full Name:</td>
                <td>{{ $employee->full_name }}</td>
            </tr>
            <tr>
                <td>Employee ID:</td>
                <td>{{ $employee->employee_id }}</td>
            </tr>
            <tr>
                <td>Date of Birth:</td>
                <td>{{ $employee->date_of_birth ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Gender:</td>
                <td>{{ $employee->gender ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Marital Status:</td>
                <td>{{ $employee->marital_status ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Qualification ID:</td>
                <td>{{ $employee->qualification_id ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Technology Stack:</td>
                <td>{{ $employee->technology_stack ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Join Date:</td>
                <td>{{ $employee->join_date ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Relieving Date:</td>
                <td>{{ $employee->releaving_date ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Status:</td>
                <td>
                    <span class="badge {{ $employee->status == 1 ? 'badge-active' : 'badge-inactive' }}">
                        {{ $employee->status == 1 ? 'Active' : 'Inactive' }}
                    </span>
                </td>
            </tr>
        </table>
    </div>

    <!-- Contact Information -->
    <div class="section">
        <div class="section-title">Contact Information</div>
        <table class="info-table">
            <tr>
                <td>Mobile Number:</td>
                <td>{{ $employee->mobile_number }}</td>
            </tr>
            <tr>
                <td>Alternative Number 1:</td>
                <td>{{ $employee->alternative_number_1 ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Alternative Number 2:</td>
                <td>{{ $employee->alternative_number_2 ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Email:</td>
                <td>{{ $employee->email ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Address:</td>
                <td>{{ $employee->address ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>City:</td>
                <td>{{ $employee->city ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>State:</td>
                <td>{{ $employee->state ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Country:</td>
                <td>{{ $employee->country ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Emergency Contact Name:</td>
                <td>{{ $employee->emergency_contact_name ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Emergency Contact Number:</td>
                <td>{{ $employee->emergency_contact_number ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Relationship:</td>
                <td>{{ $employee->relationship ?? 'N/A' }}</td>
            </tr>
        </table>
    </div>

    <!-- Employment Details -->
    <div class="section">
        <div class="section-title">Employment Details</div>
        <table class="info-table">
            <tr>
                <td>Job Title:</td>
                <td>{{ $employee->job_title ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Department ID:</td>
                <td>{{ $employee->department_id ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Designation ID:</td>
                <td>{{ $employee->designation_id ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Date of Hire:</td>
                <td>{{ $employee->date_of_hire ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Work Location:</td>
                <td>{{ $employee->work_location ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Starting Salary:</td>
                <td>{{ $employee->starting_salary ? '₹ ' . number_format($employee->starting_salary, 2) : 'N/A' }}</td>
            </tr>
        </table>
    </div>

    <!-- Additional Details -->
    <div class="section">
        <div class="section-title">Additional Details</div>
        <table class="info-table">
            <tr>
                <td>Aadhar Number:</td>
                <td>{{ $employee->aadhar_number ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>PAN Card Number:</td>
                <td>{{ $employee->pancard_number ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Bank Name:</td>
                <td>{{ $employee->bank_name ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Account Number:</td>
                <td>{{ $employee->account_number ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>IFSC Code:</td>
                <td>{{ $employee->ifsc_code ?? 'N/A' }}</td>
            </tr>
        </table>
    </div>

    <!-- Documents Section -->
    @if($employee->aadhar_file_url || $employee->pancard_file_url || $employee->experience_certificate_url || $employee->other_document_url)
    <div class="section">
        <div class="section-title">Documents</div>

        <!-- Row 1: Aadhar and PAN Card -->
        <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
            <tr>
                <!-- Aadhar Card -->
                <td style="width: 50%; padding: 10px; vertical-align: top; text-align: center;">
                    @if($employee->aadhar_file_url)
                        <div class="document-title">Aadhar Card</div>
                        @if($employee->aadhar_is_image)
                        <div class="document-image">
                            <img src="{{ $employee->aadhar_file_url }}" alt="Aadhar Card" style="max-width: 95%; max-height: 150px; border: 1px solid #e5e7eb; border-radius: 4px;">
                        </div>
                        @else
                        <div>
                            <a href="{{ $employee->aadhar_file_url }}" class="document-link">View Document</a>
                        </div>
                        @endif
                    @else
                        <div style="color: #999;">No Aadhar Card</div>
                    @endif
                </td>

                <!-- PAN Card -->
                <td style="width: 50%; padding: 10px; vertical-align: top; text-align: center;">
                    @if($employee->pancard_file_url)
                        <div class="document-title">PAN Card</div>
                        @if($employee->pancard_is_image)
                        <div class="document-image">
                            <img src="{{ $employee->pancard_file_url }}" alt="PAN Card" style="max-width: 95%; max-height: 150px; border: 1px solid #e5e7eb; border-radius: 4px;">
                        </div>
                        @else
                        <div>
                            <a href="{{ $employee->pancard_file_url }}" class="document-link">View Document</a>
                        </div>
                        @endif
                    @else
                        <div style="color: #999;">No PAN Card</div>
                    @endif
                </td>
            </tr>
        </table>

        <!-- Row 2: Experience Certificate and Other Document -->
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <!-- Experience Certificate -->
                <td style="width: 50%; padding: 10px; vertical-align: top; text-align: center;">
                    @if($employee->experience_certificate_url)
                        <div class="document-title">Experience Certificate</div>
                        @if($employee->experience_is_image)
                        <div class="document-image">
                            <img src="{{ $employee->experience_certificate_url }}" alt="Experience Certificate" style="max-width: 95%; max-height: 150px; border: 1px solid #e5e7eb; border-radius: 4px;">
                        </div>
                        @else
                        <div>
                            <a href="{{ $employee->experience_certificate_url }}" class="document-link">View Document</a>
                        </div>
                        @endif
                    @else
                        <div style="color: #999;">No Experience Certificate</div>
                    @endif
                </td>

                <!-- Other Document -->
                <td style="width: 50%; padding: 10px; vertical-align: top; text-align: center;">
                    @if($employee->other_document_url)
                        <div class="document-title">Other Document</div>
                        @if($employee->other_is_image)
                        <div class="document-image">
                            <img src="{{ $employee->other_document_url }}" alt="Other Document" style="max-width: 95%; max-height: 150px; border: 1px solid #e5e7eb; border-radius: 4px;">
                        </div>
                        @else
                        <div>
                            <a href="{{ $employee->other_document_url }}" class="document-link">View Document</a>
                        </div>
                        @endif
                    @else
                        <div style="color: #999;">No Other Document</div>
                    @endif
                </td>
            </tr>
        </table>
    </div>
    @endif
</body>
</html>
