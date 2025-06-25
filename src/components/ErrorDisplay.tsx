
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
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
  );
};

export default ErrorDisplay;
