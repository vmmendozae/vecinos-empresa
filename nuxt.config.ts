export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxtjs/supabase'],

  ui: {
    global: true,
    icons: ['heroicons', 'lucide'],
    primary: 'emerald',
    gray: 'slate',
  },

  supabase: {
    // publishable key es segura en código fuente (equivale a anon key de Supabase)
    url: 'https://gyepgqeejspozhocrpkj.supabase.co',
    key: 'sb_publishable_W6MwO6-9nC68i6frGsXn2g_Qu_FF7ct',
    // service key solo por env var (nunca en código fuente)
    serviceKey: process.env.NUXT_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY || '',
    redirect: false,
  },

  colorMode: {
    preference: 'light',
    fallback: 'light',
  },

  css: ['~/assets/css/main.css', 'leaflet/dist/leaflet.css'],

  app: {
    head: {
      title: 'Unergy Vecinos',
      meta: [
        { name: 'description', content: 'Plataforma de gestión energética para empresas' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        },
      ],
    },
  },

  compatibilityDate: '2024-11-01',
})
