import Script from 'next/script';

import { defaultTheme, themes } from '@/lib/themes';

const themeScript = `
(function () {
  try {
    var savedTheme = localStorage.getItem('socio-theme');
    var savedMode = localStorage.getItem('socio-theme-mode');
    var validTheme = savedTheme && savedTheme in ${JSON.stringify(themes)}
      ? savedTheme
      : '${defaultTheme}';
    var validMode = savedMode === 'dark' ? 'dark' : 'light';

    document.documentElement.dataset.theme = validTheme;
    document.documentElement.dataset.themeMode = validMode;
  } catch {
    document.documentElement.dataset.theme = '${defaultTheme}';
  }
})();
`;

export function ThemeScript() {
  return (
    <Script id="socio-theme-script" strategy="beforeInteractive">
      {themeScript}
    </Script>
  );
}
