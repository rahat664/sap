module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js" // add this line
  ],
  theme: {
    extend: {
      textColor: {
        'primary': '#11484F',
        'secondary': '#777777',
        'not-black': '#242424',
        'web-text-secondary': '#5D5D5D',
        'input': '#F5FBFC',
        'input-hint': '#A5B8BB',
        'another': '#FFA711',
        'green': '#1DBF73',
        'blue': '#0CD5F0',
        'red': '#F0614E',
        'disabled': '#E5EAEB',
        'link': '#0085FF',
        'app-bg': '#F9F9F9',
        'mobile-line': '#D3DBDC',
        'active': '#E7EDED',
      },
      backgroundColor: {
        'primary': '#11484F',
        'not-black': '#242424',
        'danger': '#777777',
        'web-text-secondary': '#5D5D5D',
        'input': '#F5FBFC',
        'input-hint': '#A5B8BB',
        'another': '#FFA711',
        'green': '#1DBF73',
        'blue': '#0CD5F0',
        'red': '#F0614E',
        'disabled': '#E5EAEB',
        'link': '#0085FF',
        'app-bg': '#F9F9F9',
        'mobile-line': '#D3DBDC',
        'active': '#E7EDED',
      },
      backgroundImage: {
        loginBg: "url('assets/images/login-bg.png')",
      }
    }
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
