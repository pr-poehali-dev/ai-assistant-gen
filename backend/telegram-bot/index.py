import json
import os
from typing import Dict, Any, Optional

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Telegram bot webhook handler for Miya 1 AI Assistant
    Args: event - dict with httpMethod, body, headers
          context - object with request_id, function_name attributes
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    telegram_token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    
    if not telegram_token:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Bot token not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        message = body_data.get('message', {})
        chat_id = message.get('chat', {}).get('id')
        text = message.get('text', '')
        
        if not chat_id or not text:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
        
        response_text = generate_ai_response(text)
        
        send_message(telegram_token, chat_id, response_text)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def generate_ai_response(user_message: str) -> str:
    '''Generate AI response based on user message'''
    
    greetings = ['привет', 'здравствуй', 'hello', 'hi', 'start']
    if any(greeting in user_message.lower() for greeting in greetings):
        return '👋 Привет! Я Мия 1 — твой ИИ-ассистент. Могу помочь с вопросами, создать изображения или обработать документы. Чем могу быть полезна?'
    
    help_keywords = ['помощь', 'help', 'что умеешь', 'возможности']
    if any(keyword in user_message.lower() for keyword in help_keywords):
        return '''🤖 Вот что я умею:

✨ Отвечать на вопросы
🎨 Генерировать изображения (опиши что нужно)
📄 Анализировать документы
💡 Помогать с идеями и творчеством

Просто напиши мне что тебе нужно!'''
    
    if len(user_message) < 3:
        return 'Напиши подробнее, что тебе нужно? 😊'
    
    return f'Я обработала твой запрос: "{user_message}"\n\n💭 Это демо-версия ответа. Скоро здесь будет полноценный ИИ с интеграцией OpenAI или другой модели!'


def send_message(token: str, chat_id: int, text: str) -> None:
    '''Send message to Telegram chat'''
    import urllib.request
    import urllib.parse
    
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    
    data = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML'
    }
    
    encoded_data = urllib.parse.urlencode(data).encode('utf-8')
    req = urllib.request.Request(url, data=encoded_data, method='POST')
    
    with urllib.request.urlopen(req) as response:
        response.read()
