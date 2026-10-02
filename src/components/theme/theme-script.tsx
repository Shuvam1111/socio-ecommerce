import { defaultTheme, themes } from '@/lib/themes';

const themeScript = `
(function () {
  try {
    var savedTheme = localStorage.getItem('socio-theme');
    var validTheme = savedTheme && savedTheme in ${JSON.stringify(themes)}
      ? savedTheme
      : '${defaultTheme}';

    document.documentElement.dataset.theme = validTheme;
  } catch {
    document.documentElement.dataset.theme = '${defaultTheme}';
  }
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
