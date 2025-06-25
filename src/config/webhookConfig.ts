
export interface WebhookConfig {
  url: string;
  method: string;
}

// Simulated file storage - in real app this would be handled by backend
const WEBHOOK_CONFIG_KEY = 'wiki_checker_webhook_config';

export const saveWebhookConfig = (config: WebhookConfig): void => {
  try {
    localStorage.setItem(WEBHOOK_CONFIG_KEY, JSON.stringify(config));
    console.log('Webhook config saved to file:', config);
  } catch (error) {
    console.error('Error saving webhook config:', error);
  }
};

export const loadWebhookConfig = (): WebhookConfig | null => {
  try {
    const saved = localStorage.getItem(WEBHOOK_CONFIG_KEY);
    if (saved) {
      const config = JSON.parse(saved);
      console.log('Webhook config loaded from file:', config);
      return config;
    }
  } catch (error) {
    console.error('Error loading webhook config:', error);
  }
  return null;
};

export const deleteWebhookConfig = (): void => {
  try {
    localStorage.removeItem(WEBHOOK_CONFIG_KEY);
    console.log('Webhook config deleted from file');
  } catch (error) {
    console.error('Error deleting webhook config:', error);
  }
};
