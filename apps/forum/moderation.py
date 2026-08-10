import json
import logging
import os

import httpx

logger = logging.getLogger(__name__)


class ModerationServiceError(Exception):
    def __init__(self, message, error_code='unavailable'):
        super().__init__(message)
        self.error_code = error_code


def post_contains_profanity(title, text):
    api_key = os.getenv('CEREBRAS_API_KEY')
    if not api_key:
        raise ModerationServiceError('CEREBRAS_API_KEY is not configured')

    payload = {
        'model': os.getenv('CEREBRAS_MODEL', 'gpt-oss-120b'),
        'messages': [
            {
                'role': 'system',
                'content': (
                    'You moderate forum posts. Detect insults, profanity, hate speech, '
                    'or abusive vulgar language in any language. Reply only with valid JSON '
                    'You can allow posts about bad experiencies with a person or a company, but you must not allow posts that contain insults or vulgar language. '
                    'in this exact format: {"contains_profanity": true or false}.'
                ),
            },
            {
                'role': 'user',
                'content': json.dumps({'title': title, 'text': text}, ensure_ascii=False),
            },
        ],
        'temperature': 0,
        'max_tokens': 256,
    }

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }

    for attempt in range(1, 4):
        try:
            response = httpx.post(
                'https://api.cerebras.ai/v1/chat/completions',
                headers=headers,
                json=payload,
                timeout=10.0,
            )

            if response.status_code == 401 or response.status_code == 403:
                logger.error('Cerebras authentication failed with status %s', response.status_code)
                raise ModerationServiceError('Cerebras authentication failed', 'configuration')

            if response.status_code == 429:
                logger.warning('Cerebras rate limit reached on attempt %s', attempt)
                if attempt == 3:
                    raise ModerationServiceError('Cerebras rate limit reached', 'rate_limit')
                continue

            if response.status_code >= 500:
                logger.warning('Cerebras server error %s on attempt %s', response.status_code, attempt)
                if attempt == 3:
                    raise ModerationServiceError('Cerebras server error', 'unavailable')
                continue

            response.raise_for_status()
            message = response.json()['choices'][0]['message']
            content = message.get('content')
            if not content:
                raise ValueError('Cerebras response did not include message content')
            result = json.loads(content)
            return bool(result['contains_profanity'])
        except ModerationServiceError:
            raise
        except httpx.TimeoutException as exc:
            logger.warning('Cerebras timeout on attempt %s', attempt)
            if attempt == 3:
                raise ModerationServiceError('Cerebras request timed out', 'timeout') from exc
        except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as exc:
            logger.exception('Unexpected Cerebras moderation response on attempt %s', attempt)
            if attempt == 3:
                raise ModerationServiceError('Cerebras moderation failed', 'unavailable') from exc

    raise ModerationServiceError('Cerebras moderation failed', 'unavailable')
