import { useSession, signIn, signOut } from 'next-auth/react'
import type { FC } from 'react'

type Props = {
  className: string
}

export const LoginButton: FC<Props> = ({ className }) => {
  const { data: session } = useSession()
  if (session) {
    return (
      <button className={`btn ${className}`} onClick={() => signOut()}>
        ログアウト
      </button>
    )
  }
  return (
    <button className={`btn ${className}`} onClick={() => signIn()}>
      ログイン
    </button>
  )
}
