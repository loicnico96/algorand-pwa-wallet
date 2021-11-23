import { toast } from "react-toastify"

export async function toClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
  toast.info("Copied to clipboard.")
}
