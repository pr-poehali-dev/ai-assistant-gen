import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface GeneratedImage {
  id: number;
  prompt: string;
  url: string;
  timestamp: Date;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Привет! Я твой ИИ-ассистент. Чем могу помочь?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');

    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: `Отличный вопрос! Я обработал твой запрос "${inputMessage}" и готов помочь. Это демо-версия ответа ИИ-ассистента.`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleGenerateImage = () => {
    if (!imagePrompt.trim()) return;

    setIsGenerating(true);

    setTimeout(() => {
      const newImage: GeneratedImage = {
        id: generatedImages.length + 1,
        prompt: imagePrompt,
        url: 'https://images.unsplash.com/photo-1686904423955-b3c940951953?w=400&h=400&fit=crop',
        timestamp: new Date(),
      };
      setGeneratedImages([newImage, ...generatedImages]);
      setImagePrompt('');
      setIsGenerating(false);
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse-glow">
              <Icon name="Sparkles" size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">AI Assistant</h1>
          </div>

          <nav className="flex items-center gap-4">
            <Button
              variant={activeTab === 'chat' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('chat')}
              className="gap-2"
            >
              <Icon name="MessageSquare" size={18} />
              Чат
            </Button>
            <Button
              variant={activeTab === 'images' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('images')}
              className="gap-2"
            >
              <Icon name="Image" size={18} />
              Генератор
            </Button>
            <Button
              variant={activeTab === 'documents' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('documents')}
              className="gap-2"
            >
              <Icon name="FileText" size={18} />
              Документы
            </Button>
            <Button
              variant={activeTab === 'profile' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('profile')}
              className="gap-2"
            >
              <Icon name="User" size={18} />
              Профиль
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'chat' && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            <Card className="gradient-border hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Bot" size={24} className="text-primary" />
                  Умный чат-ассистент
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4 mb-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 animate-scale-in ${
                          message.sender === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <Avatar className="h-10 w-10">
                          {message.sender === 'ai' ? (
                            <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                              <Icon name="Sparkles" size={20} className="text-white" />
                            </div>
                          ) : (
                            <>
                              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                              <AvatarFallback>Ты</AvatarFallback>
                            </>
                          )}
                        </Avatar>

                        <div
                          className={`flex-1 p-4 rounded-2xl ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <span className="text-xs opacity-70 mt-2 block">
                            {message.timestamp.toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    placeholder="Напиши свой вопрос..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="icon" className="shrink-0">
                    <Icon name="Send" size={20} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <Card className="gradient-border hover-lift mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Wand2" size={24} className="text-primary" />
                  Генератор изображений
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Опиши изображение, которое хочешь создать..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="flex-1 min-h-[100px]"
                  />
                  <Button
                    onClick={handleGenerateImage}
                    disabled={isGenerating}
                    className="shrink-0 gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Icon name="Loader2" size={20} className="animate-spin" />
                        Генерирую...
                      </>
                    ) : (
                      <>
                        <Icon name="Sparkles" size={20} />
                        Создать
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedImages.map((image) => (
                <Card key={image.id} className="gradient-border hover-lift overflow-hidden animate-scale-in">
                  <div className="aspect-square bg-muted">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{image.prompt}</p>
                    <span className="text-xs opacity-70 mt-2 block">
                      {image.timestamp.toLocaleString('ru-RU')}
                    </span>
                  </CardContent>
                </Card>
              ))}

              {generatedImages.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <Icon name="ImageOff" size={64} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Пока нет сгенерированных изображений. Создай первое!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            <Card className="gradient-border hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="FolderOpen" size={24} className="text-primary" />
                  Анализ документов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Icon name="Upload" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">
                      Загрузи документы для анализа
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Поддерживаются PDF, DOC, DOCX, TXT
                    </p>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Icon name="Files" size={18} />
                      Загруженные файлы ({uploadedFiles.length})
                    </h3>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-muted rounded-xl animate-scale-in"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon name="FileText" size={20} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Icon name="Trash2" size={18} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="grid gap-6">
              <Card className="gradient-border hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="UserCircle" size={24} className="text-primary" />
                    Профиль пользователя
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 mb-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                      <AvatarFallback>ПО</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Пользователь</h2>
                      <p className="text-muted-foreground">user@example.com</p>
                      <Badge className="mt-2 gap-1">
                        <Icon name="Shield" size={14} />
                        Pro Account
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Имя</Label>
                        <Input defaultValue="Пользователь" className="mt-2" />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input defaultValue="user@example.com" className="mt-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-border hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Lock" size={24} className="text-primary" />
                    Безопасность и доступ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Двухфакторная аутентификация</p>
                      <p className="text-sm text-muted-foreground">
                        Дополнительная защита аккаунта
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Шифрование данных</p>
                      <p className="text-sm text-muted-foreground">
                        Сквозное шифрование всех данных
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Контроль доступа</p>
                      <p className="text-sm text-muted-foreground">
                        Управление правами доступа
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Button className="w-full gap-2">
                      <Icon name="Key" size={18} />
                      Изменить пароль
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-border hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="BarChart3" size={24} className="text-primary" />
                    Статистика использования
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-xl">
                      <Icon name="MessageSquare" size={32} className="mx-auto text-primary mb-2" />
                      <p className="text-3xl font-bold">{messages.length}</p>
                      <p className="text-sm text-muted-foreground">Сообщений</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-xl">
                      <Icon name="Image" size={32} className="mx-auto text-primary mb-2" />
                      <p className="text-3xl font-bold">{generatedImages.length}</p>
                      <p className="text-sm text-muted-foreground">Изображений</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-xl">
                      <Icon name="FileText" size={32} className="mx-auto text-primary mb-2" />
                      <p className="text-3xl font-bold">{uploadedFiles.length}</p>
                      <p className="text-sm text-muted-foreground">Документов</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
