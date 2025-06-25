
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WebhookConfig as WebhookConfigType } from '../config/webhookConfig';

interface WebhookResponse {
  [key: string]: any;
}

interface ArticleCheckerProps {
  webhookConfig: WebhookConfigType | null;
  onResult: (result: WebhookResponse | null) => void;
  onError: (error: string) => void;
}

const ArticleChecker: React.FC<ArticleCheckerProps> = ({ webhookConfig, onResult, onError }) => {
  const { toast } = useToast();
  const [wikiUrl, setWikiUrl] = useState('');
  const [isChecking, setIsChecking] = useState(false);

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
    onError('');
    onResult(null);

    try {
      console.log('Sending request to webhook:', webhookConfig?.url);
      console.log('Wiki URL to check:', wikiUrl);
      console.log('HTTP Method:', webhookConfig?.method);

      const response = await fetch(webhookConfig!.url, {
        method: webhookConfig!.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: webhookConfig!.method !== 'GET' ? JSON.stringify({
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

      onResult(responseData);
      toast({
        title: "Thành công",
        description: "Đã kiểm tra bài viết thành công",
      });

    } catch (err) {
      console.error('Error calling webhook:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi kiểm tra bài viết';
      onError(errorMessage);
      
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
      </CardContent>
    </Card>
  );
};

export default ArticleChecker;
