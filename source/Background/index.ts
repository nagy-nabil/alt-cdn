import 'emoji-log';
import {browser} from 'webextension-polyfill-ts';

const providers = {
  jsdelivr: 'https://cdn.jsdelivr.net/npm/',
  unpkg: 'https://unpkg.com/',
  cdnjs: 'https://cdnjs.cloudflare.com/ajax/libs/',
  github: 'https://raw.githubusercontent.com/',
};
browser.runtime.onInstalled.addListener((): void => {
  console.emoji('🦄', 'extension installed');
});

browser.webRequest.onErrorOccurred.addListener(
  (details) => {
    if (details.error === 'net::ERR_BLOCKED_BY_CLIENT') return;
    Object.keys(providers).forEach((provider) => {
      if (details.url.search(provider) !== -1) {
        browser.storage.local.get([provider]).then((result) => {
          if (result[provider] === undefined) {
            result[provider] = 0;
          }
          result[provider] += 1;
          browser.storage.local.set(result);
        });
      }
    });
  },

  {urls: ['<all_urls>'], types: ['script']}
);

browser.storage.onChanged.addListener((changes) => {
  for (const [key, {newValue}] of Object.entries(changes)) {
    if (key in providers && newValue >= 3) {
      // user has a problem with this provider
      // notify the user to change the provider
      browser.notifications.create({
        type: 'basic',
        iconUrl: browser.runtime.getURL('assets/icons/favicon-128.png'),
        title: 'Provider Error',
        message: `You have a problem with ${key} provider, please change it from the options page`,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      });
    }
  }
});

browser.notifications.onClicked.addListener(() => {
  browser.runtime.openOptionsPage();
});