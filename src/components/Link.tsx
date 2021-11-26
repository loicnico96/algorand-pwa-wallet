import NextLink from "next/link"
import { AnchorHTMLAttributes } from "react"

export type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>

export interface LinkProps extends AnchorProps {
  href: string
}

export function Link({ children, onClick, href, ...props }: LinkProps) {
  if (href.match(/^https?:/)) {
    return (
      <a {...props} href={href} rel="noopener noreferrer" target="_blank">
        {children ?? href}
      </a>
    )
  }

  return (
    <NextLink href={href}>
      <a {...props}>{children}</a>
    </NextLink>
  )
}
