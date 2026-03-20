export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0a0f1a',
        panel: '#101827',
        panelAlt: '#0f172a',
        line: 'rgba(255,255,255,0.08)',
        accent: '#8b5cf6',
        accent2: '#22d3ee',
        success: '#34d399'
      },
      boxShadow: {
        glow: '0 20px 60px rgba(34,211,238,0.12)'
      }
    }
  },
  plugins: []
}
