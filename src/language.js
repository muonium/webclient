let languages = {
  'en': 'English',
  'de': 'Deutsch',
  'es': 'Español',
  'fr': 'Français',
  'it': 'Italiano',
  'pl': 'Polskie',
  'ru': 'Русский',
  'zh-cn': '简体中文'
}

let current = localStorage.getItem('lang')
current = current === null || !(current in languages) ? 'en' : current

export default {
  languages,
  current
}
