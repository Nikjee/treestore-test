const DUMMY_DELAY_MS = 2000

export const loadData = async () => {
  await new Promise((resolve) => setTimeout(resolve, DUMMY_DELAY_MS))

  const req = await fetch('/items.json')
  const data = await req.json()

  return data
}
