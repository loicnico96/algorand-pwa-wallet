import { Global } from "@emotion/react"
import { useTheme } from "./useTheme"

export function GlobalStyle() {
  const theme = useTheme()

  return (
    <Global
      styles={`
        html, body, #__next {
          display: flex;
          flex-direction: column;
          font-family: ${theme.fonts.join(", ")};
          height: 100%;
          margin: 0;
          padding: 0;
        }

        * {
          box-sizing: border-box;
        }

        a {
          color: inherit;
          text-decoration: none;
        }
        `}
    />
  )
}
