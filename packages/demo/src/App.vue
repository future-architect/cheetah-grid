<template>
  <div id="app">
    <header class="header">
      <div>
        <section class="header-main">
          <router-link
            :to="{ name: 'welcome' }"
            class="logo"
          >
            <img
              id="logo"
              src="./assets/logo.svg"
            >
            <span class="site-title">Cheetah Grid</span>
          </router-link>

          <span class="sns">
            <a
              class="github-button"
              href="https://github.com/future-architect/cheetah-grid"
              data-show-count="true"
              aria-label="Star future-architect/cheetah-grid on GitHub"
            >
              Star
            </a>
            <a
              href="https://twitter.com/share"
              class="twitter-share-button"
              data-url="https://future-architect.github.io/cheetah-grid/"
            >
              Tweet
            </a>

            <div
              class="fb-like"
              data-href="https://future-architect.github.io/cheetah-grid/"
              data-layout="button_count"
              data-action="like"
              data-size="small"
              data-show-faces="false"
              data-share="true"
            />
            <a href="https://www.npmjs.com/package/cheetah-grid">
              <img
                src="https://img.shields.io/npm/v/cheetah-grid.svg"
                alt="npm"
              >
            </a>
          </span>
        </section>
        <section>
          <label class="menu-title">DEMOS:</label>
          <div
            v-for="route in routes"
            :key="route.path"
            class="menu-item"
          >
            <router-link
              :to="{ name: route.name }"
            >
              <span class="link">{{ route.meta.title }}</span>
            </router-link>
          </div>

          <label class="menu-title">LINKS:</label>
          <div class="menu-item">
            <a
              href="https://future-architect.github.io/cheetah-grid/documents/index.html"
            >
              <span class="link">Documents</span>
            </a>
          </div>
          <div class="menu-item">
            <a
              class="link"
              href="https://github.com/future-architect/cheetah-grid"
            >
              <span> View on GitHub </span>
              <svg
                version="1.1"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                class="octicon octicon-mark-github"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                />
              </svg>
            </a>
          </div>
        </section>
      </div>
    </header>
    <main class="main">
      <router-view />
    </main>
    <footer class="footer">
      © 2017 - 2018 Future Corporation. Author Yosuke Ota. Code licensed under the MIT License.
    </footer>
  </div>
</template>

<script>
import router from './router'
const { routes } = router.options
export default {
  name: 'App',
  components: {
  },
  data () {
    return {
      routes
    }
  },
  computed: {
  },
  mounted () {
    (function (d, s, id) {
      const [fjs] = d.getElementsByTagName(s)
      if (d.getElementById(id)) { return }
      const js = d.createElement(s); js.id = id
      js.src = 'https://buttons.github.io/buttons.js'
      fjs.parentNode.insertBefore(js, fjs)
    }(document, 'script', 'gh-buttons'));

    (function (d, s, id) {
      const [fjs] = d.getElementsByTagName(s)
      if (d.getElementById(id)) { return }
      const js = d.createElement(s); js.id = id
      js.src = 'https://connect.facebook.net/ja_JP/sdk.js#xfbml=1&version=v2.10'
      fjs.parentNode.insertBefore(js, fjs)
    }(document, 'script', 'facebook-jssdk'));

    (function (d, s, id) {
      const [fjs] = d.getElementsByTagName(s)
      const p = /^http:/.test(d.location) ? 'http' : 'https'
      if (!d.getElementById(id)) {
        const js = d.createElement(s)
        js.id = id
        js.src = `${p}://platform.twitter.com/widgets.js`
        fjs.parentNode.insertBefore(js, fjs)
      }
    }(document, 'script', 'twitter-wjs'))
  },
  methods: {
  }
}
</script>

<style>
  #app {
    color: #2c3e50;
  }
  #app * {
    text-decoration: none;
  }
  .header {
    padding: 10px 10px 0 10px;
    background-color: #ff9933;
  }
  .header-main::after {
    content: '';
    display: block;
    clear: both;
  }
  .header .link {
    color: #fff;
  }
  .header .sns {
    padding-left: 5px;
    float: right;
  }
  .header .sns * {
    vertical-align: top;
  }
  .header .menu-item {
    display: inline-block;
    padding: 5px;
  }
  .header .octicon {
    fill: #fff;
    vertical-align: top;
  }
  .header .menu-item:hover {
    background-color: rgba(0, 0, 0, .2);
  }
  .header #logo {
    height: 50px;
  }
  .header .menu-title {
    color: #FFD;
    padding: 0 0 0 5px;
  }
  .main{
    padding: 10px;
  }
  .site-title {
    color: #fff;
    font-size: 36px;
    vertical-align: bottom;
  }

  .page-title {
    text-align: center;
  }
  .page-title h1 {
    margin: 0;
  }
  .grid {
    height: calc(100vh - 220px);
    width: 100%;
    border: solid 1px rgba(0, 0, 0, 0.26);
  }
  .main {
    min-height: calc(100vh - 140px);
  }
  .footer {
    height: 32px;
    font-size: 10.5px;
    background-color: #001a36;
    color: #fff;
    font-weight: 200;
    text-align: center;
    line-height: 32px;
  }
</style>
