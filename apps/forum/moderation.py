import json
import os

import httpx


class ModerationServiceError(Exception):
    pass


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
                    'in this exact format: {"contains_profanity": true or false}.'
                ),
            },
            {
                'role': 'user',
                'content': json.dumps({'title': title, 'text': text}, ensure_ascii=False),
            },
        ],
        'temperature': 0,
        'max_tokens': 100,
    }

    try:
        response = httpx.post(
            'https://api.cerebras.ai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            json=payload,
            timeout=10.0,
        )
        response.raise_for_status()
        content = response.json()['choices'][0]['message']['content']
        result = json.loads(content)
        return bool(result['contains_profanity'])
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as exc:
        raise ModerationServiceError('Cerebras moderation failed') from exc
