export const useCountdown = () => {
  const appConfig = useAppConfig()

  const target = new Date(appConfig.countdown.target).getTime()

  const days = ref(0)
  const hours = ref(0)
  const minutes = ref(0)
  const seconds = ref(0)
  const isExpired = ref(false)

  const update = () => {
    const now = Date.now()
    const diff = target - now

    if (diff <= 0) {
      isExpired.value = true
      days.value = 0
      hours.value = 0
      minutes.value = 0
      seconds.value = 0
      return
    }

    isExpired.value = false
    days.value = Math.floor(diff / (1000 * 60 * 60 * 24))
    hours.value = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    minutes.value = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    seconds.value = Math.floor((diff % (1000 * 60)) / 1000)
  }

  let timer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    update()
    timer = setInterval(update, 1000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  const pad = (n: number) => String(n).padStart(2, '0')

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired,
    pad,
    label: appConfig.countdown.label,
  }
}
