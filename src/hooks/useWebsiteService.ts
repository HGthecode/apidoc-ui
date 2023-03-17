import { useRouter } from 'vue-router'

export default function useWebsiteService() {
  const router = useRouter()
  const events = {
    test: function (data) {
      console.log(data)
    },
    openTab: function (data) {
      router.push({
        name: 'IframePage',
        query: {
          url: data.params.url,
          title: data.params.title,
        },
      })
    },
  }
  window.addEventListener(
    'message',
    function (e) {
      // console.log(e.data)
      const event = e.data.event
      if (event && events[event]) {
        events[event](e.data)
      }
    },
    false,
  )

  return {}
}
