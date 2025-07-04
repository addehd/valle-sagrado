# Figma Export API Documentation

This API allows you to process and store Figma-to-code export data from Figma plugins. Data is stored in a Supabase PostgreSQL database in the `banners` table.

## Base URL
```
http://localhost:5173/api/figma
```

## Endpoints

### POST `/api/figma`
Process and store a new Figma export.

#### Request Headers
- `Content-Type: application/json` or `Content-Type: application/x-www-form-urlencoded`

#### Request Body (JSON)
```json
{
  "html": "<div class=\"animate-fade-in opacity-0\" style=\"width: 320px; height: 240px; background: rgb(32, 118, 255); border-radius: 8px; display: flex; align-items: center; justify-content: center;\"><div style=\"color: rgb(255, 255, 255); font-size: 16px; font-family: Inter, sans-serif;\">Click me!</div></div>",
  "framework": "HTML",
  "settings": {
    "framework": "HTML",
    "jsx": false,
    "inlineStyle": true,
    "optimizeLayout": true,
    "layerName": false,
    "responsiveRoot": false,
    "flutterGenerationMode": "snippet",
    "swiftUIGenerationMode": "snippet",
    "roundTailwind": false,
    "apiEndpoint": "https://your-api.com/endpoint"
  },
  "metadata": {
    "timestamp": 1703721600000,
    "hasPreview": true,
    "previewSize": {
      "width": 320,
      "height": 240
    }
  }
}
```

#### Request Body (Form Data)
```
exportData={"html":"<div>...</div>","framework":"HTML",...}
```

#### Response (Success - 201)
```json
{
  "success": true,
  "data": {
    "export": {
      "html": "...",
      "framework": "HTML",
      "settings": {...},
      "metadata": {...},
      "id": "fig_api_1751055982009_qfs0t8gys",
      "processedAt": "2025-06-27T20:26:22.009Z",
      "source": "api"
    }
  },
  "message": "Export processed successfully"
}
```

#### Response (Error - 400)
```json
{
  "success": false,
  "error": "Missing required fields: html and framework are required"
}
```

### GET `/api/figma`
Retrieve processed exports with pagination.

#### Query Parameters
- `limit` (optional): Number of exports to return (default: 10, max: 50)
- `offset` (optional): Number of exports to skip (default: 0)

#### Example Request
```bash
GET /api/figma?limit=5&offset=0
```

#### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "exports": [
      {
        "html": "...",
        "framework": "HTML",
        "settings": {...},
        "metadata": {...},
        "id": "fig_api_1751055982009_qfs0t8gys",
        "processedAt": "2025-06-27T20:26:22.009Z",
        "source": "api"
      }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

### DELETE `/api/figma`
Clear all stored exports.

#### Response (Success - 200)
```json
{
  "success": true,
  "message": "Cleared 5 exports",
  "data": {
    "deletedCount": 5
  }
}
```

## Database Schema

### Banners Table (Supabase PostgreSQL)
```sql
CREATE TABLE banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  html TEXT NOT NULL,
  framework VARCHAR(50) NOT NULL DEFAULT 'HTML',
  settings JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  source VARCHAR(20) DEFAULT 'api',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
```

### Features
- **UUID Primary Keys**: Automatically generated unique identifiers
- **JSONB Storage**: Flexible storage for settings and metadata with indexing support
- **Timestamps**: Automatic created_at and updated_at tracking
- **User Tracking**: Optional association with authenticated users
- **RLS Policies**: Row Level Security for data access control
- **Indexes**: Optimized for common queries (framework, timestamps, metadata)

## Data Schema

### FigmaExportData
```typescript
interface FigmaExportData {
  html: string;                    // Required: Generated HTML code
  framework: string;               // Required: Target framework (HTML, React, Vue, etc.)
  settings: {
    framework: string;
    jsx: boolean;
    inlineStyle: boolean;
    optimizeLayout: boolean;
    layerName: boolean;
    responsiveRoot: boolean;
    flutterGenerationMode: string;
    swiftUIGenerationMode: string;
    roundTailwind: boolean;
    apiEndpoint: string;
  };
  metadata: {
    timestamp: number;             // Unix timestamp
    hasPreview: boolean;
    previewSize: {
      width: number;
      height: number;
    };
  };
}
```

## Example Usage

### cURL Examples

#### Submit Export (JSON)
```bash
curl -X POST http://localhost:5173/api/figma \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<div style=\"width: 200px; height: 100px; background: blue;\">Hello</div>",
    "framework": "HTML",
    "settings": {
      "framework": "HTML",
      "jsx": false,
      "inlineStyle": true,
      "optimizeLayout": true,
      "layerName": false,
      "responsiveRoot": false,
      "flutterGenerationMode": "snippet",
      "swiftUIGenerationMode": "snippet",
      "roundTailwind": false,
      "apiEndpoint": ""
    },
    "metadata": {
      "timestamp": 1703721600000,
      "hasPreview": true,
      "previewSize": {
        "width": 200,
        "height": 100
      }
    }
  }'
```

#### Submit Export (Form Data)
```bash
curl -X POST http://localhost:5173/api/figma \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'exportData={"html":"<div>Hello</div>","framework":"HTML","settings":{},"metadata":{"timestamp":1703721600000,"hasPreview":true,"previewSize":{"width":200,"height":100}}}'
```

#### Get Exports
```bash
curl http://localhost:5173/api/figma?limit=5&offset=0
```

#### Clear All Exports
```bash
curl -X DELETE http://localhost:5173/api/figma
```

### JavaScript Examples

#### Submit Export
```javascript
const exportData = {
  html: '<div style="width: 200px; height: 100px; background: blue;">Hello</div>',
  framework: 'HTML',
  settings: {
    framework: 'HTML',
    jsx: false,
    inlineStyle: true,
    optimizeLayout: true,
    layerName: false,
    responsiveRoot: false,
    flutterGenerationMode: 'snippet',
    swiftUIGenerationMode: 'snippet',
    roundTailwind: false,
    apiEndpoint: ''
  },
  metadata: {
    timestamp: Date.now(),
    hasPreview: true,
    previewSize: { width: 200, height: 100 }
  }
};

fetch('http://localhost:5173/api/figma', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(exportData)
})
.then(response => response.json())
.then(data => console.log(data));
```

#### Get Exports
```javascript
fetch('http://localhost:5173/api/figma?limit=10&offset=0')
  .then(response => response.json())
  .then(data => console.log(data.data.exports));
```

## Web Interface

Visit `http://localhost:5173/figma` to access the web interface for:
- Submitting exports via form
- Viewing export history
- Live preview of rendered components
- Inspecting export settings and metadata

## Security Features

- Basic HTML sanitization (removes `<script>` tags and `on*` event attributes)
- Input validation for required fields
- Content-Type validation
- Error handling and proper HTTP status codes

## Storage

Currently uses in-memory storage (resets on server restart). In production, consider:
- Database storage (PostgreSQL, MongoDB, etc.)
- File system storage
- Cloud storage solutions

## Rate Limiting

No rate limiting is currently implemented. For production use, consider:
- Request rate limiting per IP
- Authentication/API keys
- Request size limits 