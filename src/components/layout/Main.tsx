import { ReactNode } from 'react'

type Props = {
	children: ReactNode
}

export const Main = ({ children }: Props) => {
	return <main className='h-full flex flex-col'>{children}</main>
}
