
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Wifi, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveWebhookConfig, loadWebhookConfig, type WebhookConfig } from '../config/webhookConfig';

interface WebhookConfigProps {
  onConfigChange: (config: WebhookConfig) => void;
}

const WebhookConfig: React.FC<WebhookConfigProps> = ({ onConfigChange }) => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [httpMethod, setHttpMethod] = useState('POST');
  const [isTesting, setIsTesting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load saved configuration on mount
  useEffect(() => {
    const savedConfig = loadWebhookConfig();
    if (savedConfig) {
      setWebhookUrl(savedConfig.url);
      setHttpMethod(savedConfig.method);
      onConfigChange(savedConfig);
    }
  }, [onConfigChange]);

  // Handle webhook URL change without auto-saving
  const handleWebhookUrlChange = (value: string) => {
    setWebhookUrl(value);
    setHasUnsavedChanges(true);
  };

  // Handle HTTP method change without auto-saving
  const handleHttpMethodChange = (value: string) => {
    setHttpMethod(value);
    setHasUnsavedChanges(true);
  };

  // Save configuration explicitly
  const handleSaveConfiguration = () => {
    const config = { url: webhookUrl, method: httpMethod };
    saveWebhookConfig(config);
    onConfigChange(config);
    setHasUnsavedChanges(false);
    
    toast({
      title: "Thành công",
      description: "Cấu hình webhook đã được lưu thành công",
    });
  };

  const handleTestConnection = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập URL webhook trước khi test",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    console.log('Testing webhook connection:', webhookUrl, 'Method:', httpMethod);

    try {
      const response = await fetch(webhookUrl, {
        method: httpMethod,
        headers: {
          'Content-Type': 'application/json',
        },
        body: httpMethod !== 'GET' ? JSON.stringify({
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          Cấu hình Webhook (Admin)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="space-y-2">
          <Label htmlFor="http-method">HTTP Method</Label>
          <Select value={httpMethod} onValueChange={handleHttpMethodChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn HTTP method" />
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
            Chọn phương thức HTTP để gửi request đến webhook
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSaveConfiguration}
            disabled={!hasUnsavedChanges}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Lưu cấu hình
          </Button>
          
          <Button 
            onClick={handleTestConnection}
            disabled={isTesting || !webhookUrl.trim()}
            variant="outline"
            className="flex-1"
          >
            {isTesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
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
