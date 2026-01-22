# File Upload Fix - Testing Guide

## What was the problem?
The POST to `/api/documents` was failing with 400 (Bad Request) because:
1. The frontend expected different data from file upload (with `extractedText`) but our backend returns `fileId` and `webViewLink`
2. Required fields were not being populated after file upload:
   - `content` (was expecting `extractedText` which doesn't exist)
   - `category` (was left empty)

## What was fixed?
Updated `handleFileUpload` in `app/dashboard/page.tsx` to:
1. Accept the correct data structure from FileUpload component
2. Provide default values for required fields:
   - `content`: Placeholder text 
   - `category`: "General" (default)
3. Show an alert reminding users to fill remaining fields

## How to test:
1. Make sure backend is running: `docker compose ps` (should show backend and postgres)
2. Run the frontend locally: `npm run dev` 
3. Login at http://localhost:3000
4. Go to Admin Dashboard
5. Click "Add Document"
6. Switch to "File Upload" tab
7. Upload a file (.txt, .pdf, or .md)
8. After upload, you'll see:
   - Alert message about filling remaining fields
   - Form auto-populated with:
     - Document Name (from filename)
     - Content (placeholder text)
     - Description (with file info)
     - Category (default: "General")
9. Fill/modify any fields as needed
10. Click "Create Document" - it should work now!

## Backend is configured for local file storage:
- Files are saved to `backend/uploads/` directory
- Volume mounted in Docker: `./backend/uploads:/app/uploads`
- No Google Cloud Storage dependency