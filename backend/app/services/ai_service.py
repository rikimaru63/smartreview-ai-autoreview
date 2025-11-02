"""
AI service for review generation using OpenAI
"""

import openai
import logging
from typing import List, Dict, Optional, Tuple
from app.core.config import settings
from app.models.review import ReviewRequest, ReviewType, ReviewMetadata
from app.models.store import Store
import time
import re

logger = logging.getLogger(__name__)

class AIService:
    """AI service for generating reviews using OpenAI"""
    
    def __init__(self):
        """Initialize AI service with OpenAI configuration"""
        if settings.OPENAI_API_KEY:
            openai.api_key = settings.OPENAI_API_KEY
        else:
            logger.warning("OpenAI API key not configured")
    
    async def generate_review(
        self, 
        store: Store, 
        request: ReviewRequest
    ) -> Tuple[str, str, ReviewMetadata]:
        """
        Generate a review using OpenAI
        
        Args:
            store: Store information
            request: Review generation request
            
        Returns:
            Tuple of (title, content, metadata)
        """
        try:
            start_time = time.time()
            
            # Build the prompt
            prompt = self._build_prompt(store, request)
            
            # Generate review using OpenAI
            response = await self._call_openai(prompt, request)
            
            # Parse the response
            title, content = self._parse_response(response)
            
            # Create metadata
            generation_time = time.time() - start_time
            metadata = ReviewMetadata(
                keywords_used=self._extract_keywords_used(content, store.seo_keywords),
                sentiment_score=self._calculate_sentiment_score(request.rating),
                ai_model_used=settings.OPENAI_MODEL,
                generation_time=generation_time
            )
            
            return title, content, metadata
            
        except Exception as e:
            logger.error(f"AI review generation failed: {str(e)}")
            raise Exception(f"AI service error: {str(e)}")
    
    def _build_prompt(self, store: Store, request: ReviewRequest) -> str:
        """Build the prompt for OpenAI"""
        
        # Base prompt structure
        base_prompt = f"""
You are a customer who visited {store.name} ({store.description}).

Store Information:
- Name: {store.name}
- Description: {store.description}
- Location: {store.location.address}, {store.location.city}
- Services: {', '.join([service.name for service in store.services])}
"""
        
        # Add SEO keywords if requested
        if request.include_seo and store.seo_keywords:
            base_prompt += f"- SEO Keywords to naturally include: {', '.join(store.seo_keywords)}\n"
        
        # Add service-specific keywords
        if request.service_keywords:
            base_prompt += f"- Focus on these services: {', '.join(request.service_keywords)}\n"
        
        # Rating-specific instructions
        rating_instructions = self._get_rating_instructions(request.rating)
        
        # Length and tone instructions
        length_instruction = self._get_length_instruction(request.review_length)
        tone_instruction = self._get_tone_instruction(request.tone)
        
        # Language instruction
        language_instruction = "Write the review in Japanese." if request.language == "ja" else f"Write the review in {request.language}."
        
        # Custom prompt if provided
        custom_instruction = f"\nAdditional requirements: {request.custom_prompt}" if request.custom_prompt else ""
        
        full_prompt = f"""
{base_prompt}

Please write a {request.rating}-star review as a customer experience.

Instructions:
- {rating_instructions}
- {length_instruction}
- {tone_instruction}
- {language_instruction}
- Format the response as "Title: [title]\\nReview: [review content]"
- Make it sound authentic and personal
- Include specific details about the experience
{custom_instruction}

Write the review now:
"""
        
        return full_prompt.strip()
    
    def _get_rating_instructions(self, rating: int) -> str:
        """Get rating-specific instructions"""
        instructions = {
            5: "Express exceptional satisfaction and highlight outstanding aspects of the service",
            4: "Show satisfaction with minor areas for potential improvement",
            3: "Provide balanced feedback with both positive aspects and constructive suggestions",
            2: "Express disappointment while remaining constructive and fair",
            1: "Express significant dissatisfaction but maintain professionalism"
        }
        return instructions.get(rating, "Provide honest feedback about the experience")
    
    def _get_length_instruction(self, length: str) -> str:
        """Get length-specific instructions"""
        instructions = {
            "short": "Keep the review concise (50-100 words)",
            "medium": "Write a detailed review (100-200 words)",
            "long": "Provide a comprehensive review (200-300 words)"
        }
        return instructions.get(length, "Write a medium-length review")
    
    def _get_tone_instruction(self, tone: str) -> str:
        """Get tone-specific instructions"""
        instructions = {
            "formal": "Use formal and professional language",
            "friendly": "Use warm and friendly language",
            "casual": "Use casual and conversational language"
        }
        return instructions.get(tone, "Use a friendly tone")
    
    async def _call_openai(self, prompt: str, request: ReviewRequest) -> str:
        """Call OpenAI API"""
        try:
            client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            
            response = await client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that writes authentic customer reviews."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=settings.OPENAI_MAX_TOKENS,
                temperature=settings.OPENAI_TEMPERATURE,
                top_p=0.9,
                frequency_penalty=0.3,
                presence_penalty=0.3
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"OpenAI API call failed: {str(e)}")
            raise Exception(f"Failed to generate review: {str(e)}")
    
    def _parse_response(self, response: str) -> Tuple[str, str]:
        """Parse OpenAI response to extract title and content"""
        try:
            # Look for the format "Title: [title]\nReview: [content]"
            title_match = re.search(r'Title:\s*(.+?)(?:\n|$)', response, re.IGNORECASE)
            review_match = re.search(r'Review:\s*(.+)', response, re.IGNORECASE | re.DOTALL)
            
            if title_match and review_match:
                title = title_match.group(1).strip()
                content = review_match.group(1).strip()
            else:
                # Fallback: split by lines and use first line as title
                lines = response.strip().split('\n')
                title = lines[0].strip()
                content = '\n'.join(lines[1:]).strip() if len(lines) > 1 else response.strip()
            
            # Clean up title (remove "Title:" prefix if it exists)
            title = re.sub(r'^Title:\s*', '', title, flags=re.IGNORECASE)
            title = re.sub(r'^Review:\s*', '', title, flags=re.IGNORECASE)
            
            # Clean up content (remove "Review:" prefix if it exists)
            content = re.sub(r'^Review:\s*', '', content, flags=re.IGNORECASE)
            
            # Ensure we have both title and content
            if not title:
                title = "Great experience" if "good" in content.lower() or "great" in content.lower() else "Service review"
            
            if not content:
                content = response.strip()
            
            return title[:100], content  # Limit title length
            
        except Exception as e:
            logger.error(f"Failed to parse AI response: {str(e)}")
            # Fallback: use the entire response as content
            return "AI Generated Review", response.strip()
    
    def _extract_keywords_used(self, content: str, seo_keywords: List[str]) -> List[str]:
        """Extract which SEO keywords were used in the content"""
        content_lower = content.lower()
        used_keywords = []
        
        for keyword in seo_keywords:
            if keyword.lower() in content_lower:
                used_keywords.append(keyword)
        
        return used_keywords
    
    def _calculate_sentiment_score(self, rating: int) -> float:
        """Calculate sentiment score based on rating (simple mapping)"""
        # Map rating to sentiment score (0.0 to 1.0)
        sentiment_map = {
            1: 0.1,
            2: 0.3,
            3: 0.5,
            4: 0.7,
            5: 0.9
        }
        return sentiment_map.get(rating, 0.5)
    
    async def suggest_improvements(self, store: Store, feedback_content: str) -> List[str]:
        """Generate improvement suggestions based on negative feedback"""
        try:
            prompt = f"""
Based on this customer feedback for {store.name}:
"{feedback_content}"

Please provide 3-5 specific, actionable improvement suggestions for the business.
Focus on practical steps they can take to address the concerns raised.

Format each suggestion as a bullet point.
Keep suggestions concise and specific.
Write in Japanese.
"""
            
            client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            
            response = await client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a business consultant providing actionable improvement suggestions."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=300,
                temperature=0.7
            )
            
            content = response.choices[0].message.content.strip()
            
            # Parse suggestions (split by bullet points or lines)
            suggestions = []
            for line in content.split('\n'):
                line = line.strip()
                if line and (line.startswith('•') or line.startswith('-') or line.startswith('*')):
                    suggestion = re.sub(r'^[•\-\*]\s*', '', line).strip()
                    if suggestion:
                        suggestions.append(suggestion)
                elif line and not any(char in line for char in [':', '？', '?']):
                    suggestions.append(line)
            
            return suggestions[:5]  # Limit to 5 suggestions
            
        except Exception as e:
            logger.error(f"Failed to generate improvement suggestions: {str(e)}")
            return [
                "We sincerely take customer feedback into account and strive to improve our services.",
                "We will strengthen staff training and improve service quality.",
                "We will review facilities and service environment."
            ]

# Global AI service instance
ai_service = AIService()