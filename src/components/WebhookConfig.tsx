
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Wifi, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { loadWebhookConfig, type WebhookConfig } from '../config/webhookConfig';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WebhookConfigProps {
  onConfigChange: (config: WebhookConfig) => void;
}

const WebhookConfig: React.FC<WebhookConfigProps> = ({ onConfigChange }) => {
  const { toast } = useToast();
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Load hardcoded configuration on mount
  useEffect(() => {
    const config = loadWebhookConfig();
    setWebhookConfig(config);
    onConfigChange(config);
  }, [onConfigChange]);

  const handleTestConnection = async () => {
    if (!webhookConfig?.url.trim()) {
      toast({
        title: "Lỗi",
        description: "Không có URL webhook để test",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    console.log('Testing webhook connection:', webhookConfig.url, 'Method:', webhookConfig.method);

    try {
      const response = await fetch(webhookConfig.url, {
        method: webhookConfig.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: webhookConfig.method !== 'GET' ? JSON.stringify({
          test: true,
          timestamp: new Date().toISOString()
        }) : undefined,
      });

      if (response.ok) {
        toast({
          title: "Thành công",
          description: `Webhook kết nối thành công (${response.status})`,
        });
      } else {
        toast({
          title: "Cảnh báo",
          description: `Webhook phản hồi với status ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error testing webhook connection:', err);
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến webhook. Vui lòng kiểm tra URL.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (!webhookConfig) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          Cấu hình Webhook (Admin)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Webhook URL đã được cấu hình cố định trong hệ thống và không thể thay đổi.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="webhook-url">URL Webhook n8n (Cố định)</Label>
          <Input
            id="webhook-url"
            type="url"
            value={webhookConfig.url}
            readOnly
            className="w-full bg-gray-50 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500">
            URL webhook đã được cấu hình cố định cho hệ thống
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="http-method">HTTP Method (Cố định)</Label>
          <Select value={webhookConfig.method} disabled>
            <SelectTrigger className="w-full bg-gray-50 cursor-not-allowed">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            HTTP method đã được cấu hình cố định
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleTestConnection}
            disabled={isTesting}
            className="w-full"
          >
            {isTesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang test kết nối...
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 mr-2" />
                Test Connect
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookConfig;
