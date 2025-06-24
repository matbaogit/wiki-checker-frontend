
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { LogOut, Search, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WebhookResponse {
  [key: string]: any;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [wikiUrl, setWikiUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<WebhookResponse | null>(null);
  const [error, setError] = useState('');

  // Load webhook URL from localStorage on mount
  useEffect(() => {
    const savedWebhookUrl = localStorage.getItem('wiki_checker_webhook_url');
    if (savedWebhookUrl) {
      setWebhookUrl(savedWebhookUrl);
    }
  }, []);

  // Save webhook URL to localStorage when it changes
  const handleWebhookUrlChange = (value: string) => {
    setWebhookUrl(value);
    localStorage.setItem('wiki_checker_webhook_url', value);
  };

  const handleCheckArticle = async () => {
    if (!wikiUrl.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập link bài viết Wiki",
        variant: "destructive",
      });
      return;
    }

    if (!webhookUrl.trim()) {
      toast({
        title: "Lỗi", 
        description: "Vui lòng cấu hình URL webhook trước",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    setError('');
    setResult(null);

    try {
      console.log('Sending request to webhook:', webhookUrl);
      console.log('Wiki URL to check:', wikiUrl);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: wikiUrl.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Webhook response:', data);
      
      setResult(data);
      toast({
        title: "Thành công",
        description: "Đã kiểm tra bài viết thành công",
      });

    } catch (err) {
      console.error('Error calling webhook:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi kiểm tra bài viết';
      setError(errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Kết quả kiểm tra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Công cụ kiểm tra bài viết Wiki
            </h1>
            <p className="text-sm text-gray-600">
              Xin chào, <span className="font-medium">{user?.username}</span>
            </p>
          </div>
          <Button 
            onClick={logout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Webhook Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Cấu hình Webhook
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL Webhook n8n</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => handleWebhookUrlChange(e.target.value)}
                  placeholder="https://your-n8n-instance.com/webhook/..."
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Nhập URL webhook của n8n để gửi yêu cầu kiểm tra bài viết
                </p>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Article Checker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-teal-600" />
                Kiểm tra bài viết
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wiki-url">Link bài viết Wiki</Label>
                <Input
                  id="wiki-url"
                  type="url"
                  value={wikiUrl}
                  onChange={(e) => setWikiUrl(e.target.value)}
                  placeholder="https://wiki.matbao.net/..."
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Nhập link bài viết trên wiki.matbao.net cần kiểm tra
                </p>
              </div>

              <Button 
                onClick={handleCheckArticle}
                disabled={isChecking || !wikiUrl.trim() || !webhookUrl.trim()}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {isChecking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang kiểm tra...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Kiểm tra bài viết
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {renderResult()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
