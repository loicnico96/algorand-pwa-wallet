import NextLink from "next/link"
import { AnchorHTMLAttributes, forwardRef } from "react"

export type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>

export interface LinkProps extends AnchorProps {
  href: string
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const { href } = props

  if (href.match(/^https?:/)) {
    return <a {...props} ref={ref} rel="noopener noreferrer" target="_blank" />
  }

  return (
    <NextLink href={href}>
      <a {...props} ref={ref} />
    </NextLink>
  )
})

Link.displayName = "Link"
