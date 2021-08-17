const config = {
  platform: process.platform,
  port: process.env.PORT ? process.env.PORT : 3000,
  languages: [
    { label: '中文简体', value: 'zhCn' },
    { label: 'English', value: 'en' },
  ],
  fallbackLng: 'en',
  defaultLanguage: 'zhCn',
};

export default config;
