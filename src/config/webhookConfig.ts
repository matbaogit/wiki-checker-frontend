
export interface WebhookConfig {
  url: string;
  method: string;
}

// Hardcoded webhook configuration
const HARDCODED_WEBHOOK_CONFIG: WebhookConfig = {
  url: 'https://workflows-in.matbao.com/webhook/c80e6459-013c-4dfa-a675-9384c78cf83b',
  method: 'POST'
};

// Simulated file storage - in real app this would be handled by backend
const WEBHOOK_CONFIG_KEY = 'wiki_checker_webhook_config';

export const saveWebhookConfig = (config: WebhookConfig): void => {
  try {
    localStorage.setItem(WEBHOOK_CONFIG_KEY, JSON.stringify(config));
    console.log('Webhook config saved to file (but hardcoded config will be used):', config);
  } catch (error) {
    console.error('Error saving webhook config:', error);
  }
};

export const loadWebhookConfig = (): WebhookConfig => {
  // Always return the hardcoded configuration
  console.log('Using hardcoded webhook config:', HARDCODED_WEBHOOK_CONFIG);
  return HARDCODED_WEBHOOK_CONFIG;
};

export const deleteWebhookConfig = (): void => {
  try {
    localStorage.removeItem(WEBHOOK_CONFIG_KEY);
    console.log('Webhook config deleted from file (but hardcoded config will still be used)');
  } catch (error) {
    console.error('Error deleting webhook config:', error);
  }
};
