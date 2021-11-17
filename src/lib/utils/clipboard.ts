export async function toClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}
