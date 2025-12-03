import json
import os
import urllib.request
import urllib.parse
from typing import Dict, Any, List, Optional

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Telegram bot webhook handler for Miya 1 AI Assistant with web search
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
    openai_key = os.environ.get('OPENAI_API_KEY', '')
    
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
        user_name = message.get('from', {}).get('first_name', 'друг')
        
        if not chat_id or not text:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
        
        if text.startswith('/'):
            response_text = handle_command(text, user_name)
        else:
            send_typing(telegram_token, chat_id)
            response_text = generate_smart_response(text, user_name, openai_key)
        
        send_message(telegram_token, chat_id, response_text)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        error_message = f'❌ Произошла ошибка: {str(e)}'
        if chat_id:
            send_message(telegram_token, chat_id, error_message)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True, 'error': str(e)}),
            'isBase64Encoded': False
        }


def handle_command(command: str, user_name: str) -> str:
    '''Handle bot commands'''
    command_lower = command.lower().strip()
    
    if command_lower in ['/start', '/help']:
        return f'''👋 Привет, {user_name}! Я <b>Мия 1</b> — твой умный ИИ-ассистент.

🌐 <b>Я использую интернет</b> для поиска актуальной информации и могу ответить на любые вопросы!

<b>Что я умею:</b>
✨ Отвечать на вопросы с поиском в интернете
💡 Помогать с решением задач
📚 Объяснять сложные темы просто
🌍 Искать актуальную информацию
📊 Анализировать данные

<b>Команды:</b>
/start - Начать работу
/help - Показать помощь
/about - Обо мне

Просто напиши мне свой вопрос, и я найду ответ! 🚀'''
    
    if command_lower == '/about':
        return '''🤖 <b>Мия 1 — Умный ИИ-ассистент</b>

Я создана на базе передовых технологий искусственного интеллекта и имею доступ к интернету для поиска актуальной информации.

<b>Мои возможности:</b>
• Поиск информации в реальном времени
• Ответы на вопросы любой сложности
• Помощь в обучении и работе
• Анализ и обработка данных

Версия: 1.0
Создано с ❤️ на poehali.dev'''
    
    return '❓ Неизвестная команда. Используй /help для списка команд.'


def generate_smart_response(user_message: str, user_name: str, openai_key: str) -> str:
    '''Generate smart AI response with web search capability'''
    
    if not openai_key:
        return '''⚠️ Для работы умного ассистента нужен OpenAI API ключ.

Пока я работаю в базовом режиме. Для полноценной работы с интернет-поиском администратору нужно добавить OPENAI_API_KEY в настройки.'''
    
    needs_search = should_use_search(user_message)
    
    search_results = ''
    if needs_search:
        search_results = perform_web_search(user_message)
    
    prompt = build_prompt(user_message, user_name, search_results)
    
    try:
        response = call_openai(prompt, openai_key)
        return response
    except Exception as e:
        return f'❌ Ошибка при генерации ответа: {str(e)}\n\nПопробуй переформулировать вопрос.'


def should_use_search(message: str) -> bool:
    '''Determine if web search is needed'''
    search_indicators = [
        'сколько', 'когда', 'где', 'кто', 'что такое',
        'как называется', 'последние новости', 'актуальн',
        'сейчас', 'сегодня', 'текущ', 'новост',
        'погода', 'курс', 'цена', 'стоимость'
    ]
    
    message_lower = message.lower()
    return any(indicator in message_lower for indicator in search_indicators)


def perform_web_search(query: str) -> str:
    '''Perform web search using DuckDuckGo'''
    try:
        encoded_query = urllib.parse.quote(query)
        url = f'https://api.duckduckgo.com/?q={encoded_query}&format=json&no_html=1&skip_disambig=1'
        
        req = urllib.request.Request(url)
        req.add_header('User-Agent', 'Mozilla/5.0')
        
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            abstract = data.get('AbstractText', '')
            if abstract:
                return f"Информация из интернета: {abstract}"
            
            related = data.get('RelatedTopics', [])
            if related and len(related) > 0:
                results = []
                for topic in related[:3]:
                    if isinstance(topic, dict) and 'Text' in topic:
                        results.append(topic['Text'])
                
                if results:
                    return "Информация из интернета:\n" + "\n".join(results)
        
        return ''
        
    except Exception:
        return ''


def build_prompt(user_message: str, user_name: str, search_results: str) -> str:
    '''Build prompt for OpenAI'''
    system_context = f'''Ты — Мия 1, умный и дружелюбный ИИ-ассистент в Telegram.
Твоя задача — помогать пользователю {user_name} с вопросами, используя доступную информацию.

Правила:
- Отвечай кратко и по делу (до 300 слов)
- Используй эмодзи для наглядности
- Будь дружелюбной и вежливой
- Если есть информация из интернета, используй её
- Форматируй текст для читаемости'''
    
    if search_results:
        return f'''{system_context}

Вопрос пользователя: {user_message}

{search_results}

Ответь на вопрос, используя найденную информацию.'''
    else:
        return f'''{system_context}

Вопрос пользователя: {user_message}

Ответь на вопрос на основе своих знаний.'''


def call_openai(prompt: str, api_key: str) -> str:
    '''Call OpenAI API'''
    url = 'https://api.openai.com/v1/chat/completions'
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    
    data = {
        'model': 'gpt-4o-mini',
        'messages': [
            {'role': 'system', 'content': 'Ты Мия 1 — умный и дружелюбный ИИ-ассистент.'},
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.7,
        'max_tokens': 800
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    
    with urllib.request.urlopen(req, timeout=30) as response:
        result = json.loads(response.read().decode('utf-8'))
        return result['choices'][0]['message']['content']


def send_typing(token: str, chat_id: int) -> None:
    '''Send typing action to show bot is working'''
    try:
        url = f'https://api.telegram.org/bot{token}/sendChatAction'
        data = {'chat_id': chat_id, 'action': 'typing'}
        encoded_data = urllib.parse.urlencode(data).encode('utf-8')
        req = urllib.request.Request(url, data=encoded_data, method='POST')
        
        with urllib.request.urlopen(req, timeout=5) as response:
            response.read()
    except Exception:
        pass


def send_message(token: str, chat_id: int, text: str) -> None:
    '''Send message to Telegram chat'''
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    
    data = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML'
    }
    
    encoded_data = urllib.parse.urlencode(data).encode('utf-8')
    req = urllib.request.Request(url, data=encoded_data, method='POST')
    
    with urllib.request.urlopen(req, timeout=10) as response:
        response.read()
