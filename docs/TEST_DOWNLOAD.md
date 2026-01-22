# File Download Fix - Testing Guide

## What was the problem?
When trying to download a file from a document, the error showed:
- 404 Not Found
- "Original file not found on server"

This happened because:
1. When files are uploaded, we store only the `fileId` (e.g., `1758590846963515425_HNmponaZ`) in the database
2. But the actual file has an extension (e.g., `1758590846963515425_HNmponaZ.txt`)
3. The download function expected a full file path

## What was fixed?
1. Updated `downloadDocument()` to handle both:
   - Full file paths (for legacy documents)
   - File IDs (for newly uploaded documents)
   - It searches the uploads directory for files starting with the fileId

2. Added a new direct download endpoint:
   - `/api/files/:fileId` - Downloads files directly by their ID
   - This matches the `webViewLink` returned during upload

## How to test:

### Method 1: Download from Document
1. Login and go to the dashboard
2. Find a document that has an attached file (look for the download button)
3. Click the download button
4. The file should download with the correct filename

### Method 2: Direct File Download
If you know the fileId, you can use the direct endpoint:
```
http://localhost:8080/api/files/1758590846963515425_HNmponaZ
```

## Currently uploaded files:
```
1758590846963515425_HNmponaZ.txt
1758590983458228414_tvft7DbA.pdf
1758591463816167489_9F4LPIz4.pdf
```

## Backend logs will show:
```
🔍 Attempting to download document ID: 8
📄 Found document: Name='test_upload', FilePath='1758590846963515425_HNmponaZ'
📁 Resolved file path: 1758590846963515425_HNmponaZ -> uploads/1758590846963515425_HNmponaZ.txt
🚀 Serving file: uploads/1758590846963515425_HNmponaZ.txt
```