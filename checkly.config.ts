import { defineConfig } from 'checkly';
import { EmailAlertChannel, Frequency } from 'checkly/constructs';

const sendDefaults = {
  sendFailure: true,
  sendRecovery: true,
  sendDegraded: true,
};

const productionURL = 'https://lunacea.jp';

const emailChannel = new EmailAlertChannel('email-channel-1', {
  address: 'contact@lunacea.jp',
  ...sendDefaults,
});

export const config = defineConfig({
  projectName: 'Lunacea Portfolio',
  logicalId: 'lunacea-portfolio',
  repoUrl: 'https://github.com/Lunacea/lunacea-portfolio',
  

  
  checks: {
    locations: ['us-east-1', 'eu-west-1'],
    tags: ['website', 'e2e', 'portfolio'],
    runtimeId: '2024.02',
    
    // チェックの設定を改善
    activated: true,
    muted: false,
    doubleCheck: true,
    shouldFail: true,
    
    // タイムアウト設定（runtimeIdで設定済み）
    
    browserChecks: {
      frequency: Frequency.EVERY_24H,
      testMatch: '**/tests/e2e/**/*.check.e2e.ts',
      alertChannels: [emailChannel],
    },
    
    playwrightConfig: {
      use: {
        baseURL: process.env.ENVIRONMENT_URL || productionURL,
        extraHTTPHeaders: {
          'x-vercel-protection-bypass': process.env.VERCEL_BYPASS_TOKEN,
        },
      },
    },
  },
  
  cli: {
    runLocation: 'us-east-1',
    reporters: ['list'],
    privateRunLocation: 'us-east-1',
  },
  

});

export default config;
