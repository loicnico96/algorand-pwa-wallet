import styled from "@emotion/styled"

import { Interactive } from "../Interactive"

export const Card = styled(Interactive)`
  background-color: #ccc;
  border: 2px solid #444;
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.5em 1em;

  &:focus {
    outline: 2px solid #444;
  }
`
