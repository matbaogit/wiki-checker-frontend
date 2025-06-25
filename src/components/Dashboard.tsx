
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import DashboardHeader from './DashboardHeader';
import ArticleChecker from './ArticleChecker';
import ErrorDisplay from './ErrorDisplay';
import ResultDisplay from './ResultDisplay';
import WebhookConfig from './WebhookConfig';
import { WebhookConfig as WebhookConfigType, loadWebhookConfig } from '../config/webhookConfig';

interface WebhookResponse {
  [key: string]: any;
}

const Dashboard: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfigType | null>(null);
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

  const handleResult = (result: WebhookResponse | null) => {
    setResult(result);
  };

  const handleError = (error: string) => {
    setError(error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardHeader 
        username={user?.username || ''}
        isAdmin={isAdmin}
        onLogout={logout}
      />

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
          <ArticleChecker 
            webhookConfig={webhookConfig}
            onResult={handleResult}
            onError={handleError}
          />

          {/* Error Display */}
          <ErrorDisplay error={error} />

          {/* Results */}
          <ResultDisplay result={result} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
