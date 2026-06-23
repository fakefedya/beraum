type Props = {
	children: React.ReactNode
}

export const Section = ({ children }: Props) => {
	return <section className='flex flex-col'>{children}</section>
}
