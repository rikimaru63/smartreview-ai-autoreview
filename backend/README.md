# SmartReview AI Backend

AI-powered review generation system with SEO optimization for businesses. This backend provides REST API endpoints for store management, AI review generation, and feedback capture.

## Features

### Core Features
- **AI Review Generation**: OpenAI-powered review generation with customizable prompts
- **Store Management**: QR code-based store identification and management
- **Rating-based Routing**: High ratings → external platforms, low ratings → feedback capture
- **SEO Optimization**: Automatic keyword integration in generated reviews
- **Feedback System**: Capture and analyze negative feedback for improvements
- **Multi-language Support**: Japanese and English review generation

### API Endpoints

#### Store Management (`/api/v1/stores`)
- `GET /stores` - List stores with pagination and search
- `GET /stores/{store_id}` - Get store by ID
- `GET /stores/qr/{qr_code}` - Get store by QR code
- `POST /stores` - Create new store
- `PUT /stores/{store_id}` - Update store
- `DELETE /stores/{store_id}` - Delete store
- Store services and platforms management endpoints

#### Review Management (`/api/v1/reviews`)
- `POST /reviews/generate` - Generate AI review
- `GET /reviews` - List reviews with filtering
- `GET /reviews/{review_id}` - Get review by ID
- `POST /reviews` - Create manual review
- `PUT /reviews/{review_id}` - Update review
- `POST /reviews/{review_id}/publish` - Publish review
- `GET /reviews/analytics/summary` - Get review analytics
- Feedback capture endpoints for low-rating reviews

## Quick Start

### Prerequisites
- Python 3.8+
- OpenAI API key (optional, for AI features)

### Installation

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables** in `.env`:
   ```env
   # Application
   APP_NAME=SmartReview AI
   APP_ENV=development
   DEBUG=true

   # OpenAI (optional)
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4-turbo-preview

   # Security
   SECRET_KEY=your-secret-key-here
   ```

4. **Run the application**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Access the API**:
   - API Documentation: http://localhost:8000/api/docs
   - Health Check: http://localhost:8000/health
   - API Info: http://localhost:8000/api/v1/info

## Project Structure

```
backend/
├── app/
│   ├── api/                    # API layer
│   │   └── v1/
│   │       ├── endpoints/      # API endpoints
│   │       │   ├── store.py    # Store endpoints
│   │       │   └── review.py   # Review endpoints
│   │       └── api.py          # Main API router
│   ├── core/                   # Core configuration
│   │   ├── config.py           # Settings management
│   │   └── security.py         # Security utilities
│   ├── models/                 # Data models
│   │   ├── store.py            # Store models
│   │   └── review.py           # Review models
│   ├── services/               # Business logic
│   │   ├── store_service.py    # Store management
│   │   ├── review_service.py   # Review operations
│   │   └── ai_service.py       # OpenAI integration
│   ├── utils/                  # Utilities
│   └── main.py                 # FastAPI application
├── tests/                      # Test files
├── requirements.txt            # Dependencies
├── Dockerfile                  # Container configuration
└── README.md                   # This file
```

## Usage Examples

### Generate AI Review

```bash
curl -X POST "http://localhost:8000/api/v1/reviews/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "sample-salon-001",
    "rating": 5,
    "language": "ja",
    "reviewLength": "medium",
    "tone": "friendly",
    "includeSeo": true
  }'
```

### Get Store by QR Code

```bash
curl "http://localhost:8000/api/v1/stores/qr/qr_sample_001"
```

### Capture Low-Rating Feedback

```bash
curl -X POST "http://localhost:8000/api/v1/reviews/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "sample-salon-001",
    "rating": 2,
    "feedbackContent": "Service was slow and staff seemed uninterested",
    "improvementAreas": ["service speed", "staff training"]
  }'
```

## Data Models

### Store
- Store information, location, services, SEO keywords
- QR code mappings for easy identification
- Platform integrations (Google, HotPepper, etc.)
- Configurable settings for review routing

### Review
- AI-generated or manual reviews
- Rating-based type classification (positive/neutral/negative)
- SEO keyword integration
- Metadata tracking (generation time, AI model used)
- Publishing workflow

### Feedback
- Low-rating feedback capture
- AI-powered improvement suggestions
- Follow-up tracking

## Development

### Running Tests
```bash
python test_structure.py  # Structure and syntax tests
pytest                    # Unit tests (when implemented)
```

### Code Quality
```bash
black app/                # Code formatting
flake8 app/              # Linting
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | SmartReview AI |
| `APP_ENV` | Environment (development/production) | development |
| `DEBUG` | Debug mode | true |
| `OPENAI_API_KEY` | OpenAI API key | None |
| `OPENAI_MODEL` | OpenAI model | gpt-4-turbo-preview |
| `SECRET_KEY` | Security secret key | change-this-secret-key-in-production |

## Deployment

### Docker
```bash
docker build -t smartreview-ai-backend .
docker run -p 8000:8000 smartreview-ai-backend
```

### Production Considerations
- Set `APP_ENV=production`
- Configure proper `SECRET_KEY`
- Set up database instead of in-memory storage
- Configure logging and monitoring
- Set up HTTPS and security headers

## Next Steps for Production

1. **Database Integration**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Authentication**: Implement JWT-based authentication
3. **Rate Limiting**: Add rate limiting for API endpoints
4. **Monitoring**: Add logging, metrics, and health checks
5. **Testing**: Implement comprehensive unit and integration tests
6. **Documentation**: Generate OpenAPI documentation
7. **Deployment**: Set up CI/CD pipeline and containerization

## License

[Add your license information here]