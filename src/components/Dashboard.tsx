import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { LogOut, Search, AlertCircle, Crown, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import ResultDisplay from './ResultDisplay';
import WebhookConfig from './WebhookConfig';
import { WebhookConfig as WebhookConfigType, loadWebhookConfig } from '../config/webhookConfig';

interface WebhookResponse {
  [key: string]: any;
}

const Dashboard: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { toast } = useToast();
  const [wikiUrl, setWikiUrl] = useState('');
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfigType | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<WebhookResponse | null>(null);
  const [error, setError] = useState('');

  // Load webhook config on mount - now always returns hardcoded config
  useEffect(() => {
    const config = loadWebhookConfig();
    setWebhookConfig(config);
  }, []);

  const handleWebhookConfigChange = (config: WebhookConfigType) => {
    setWebhookConfig(config);
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

    setIsChecking(true);
    setError('');
    setResult(null);

    try {
      console.log('Sending request to webhook:', webhookConfig.url);
      console.log('Wiki URL to check:', wikiUrl);
      console.log('HTTP Method:', webhookConfig.method);

      const response = await fetch(webhookConfig.url, {
        method: webhookConfig.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: webhookConfig.method !== 'GET' ? JSON.stringify({
          url: wikiUrl.trim()
        }) : undefined,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Try to parse the response even if it's an error
      let responseData;
      try {
        responseData = await response.json();
        console.log('Response data:', responseData);
      } catch (parseError) {
        console.log('Failed to parse response as JSON:', parseError);
        responseData = null;
      }

      if (!response.ok) {
        // Show detailed error information from the webhook
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (responseData) {
          if (responseData.message) {
            errorMessage = `Webhook Error: ${responseData.message}`;
          } else if (responseData.error) {
            errorMessage = `Webhook Error: ${responseData.error}`;
          }
          
          // Also show the full error response for debugging
          console.log('Full error response:', responseData);
        }

        throw new Error(errorMessage);
      }

      setResult(responseData);
      toast({
        title: "Thành công",
        description: "Đã kiểm tra bài viết thành công",
      });

    } catch (err) {
      console.error('Error calling webhook:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi kiểm tra bài viết';
      setError(errorMessage);
      
      // Show more detailed error information in toast
      toast({
        title: "Lỗi Webhook",
        description: errorMessage.includes('Workflow Webhook Error') 
          ? "N8N workflow không thể khởi động. Vui lòng kiểm tra cấu hình workflow trong n8n."
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
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
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-600">
                Xin chào, <span className="font-medium">{user?.username}</span>
              </p>
              <Badge variant={isAdmin ? "default" : "secondary"} className="flex items-center gap-1">
                {isAdmin ? <Crown className="h-3 w-3" /> : <User className="h-3 w-3" />}
                {isAdmin ? 'Admin' : 'User'}
              </Badge>
            </div>
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
          {/* Webhook Configuration - Only for Admin */}
          {isAdmin && (
            <>
              <WebhookConfig onConfigChange={handleWebhookConfigChange} />
              <Separator />
            </>
          )}

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

              {/* Remove the webhook config warning since it's now always configured */}
              
              <Button 
                onClick={handleCheckArticle}
                disabled={isChecking || !wikiUrl.trim()}
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
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium">Chi tiết lỗi:</div>
                      <div className="text-sm">{error}</div>
                      {error.includes('Workflow Webhook Error') && (
                        <div className="text-sm mt-2 p-2 bg-red-50 rounded border">
                          <strong>Gợi ý khắc phục:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Kiểm tra workflow trong n8n có đang hoạt động không</li>
                            <li>Đảm bảo webhook trigger được cấu hình đúng</li>
                            <li>Kiểm tra các node trong workflow có lỗi không</li>
                            <li>Thử test workflow trực tiếp trong n8n</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <ResultDisplay result={result} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
