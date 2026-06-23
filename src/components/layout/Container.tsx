import { cn } from '@/src/lib/utils'

interface Props {
	children: React.ReactNode
	isWide?: boolean
	className?: string
}

export const Container = ({ children, className, isWide = false }: Props) => {
	return (
		<div
			className={cn(
				'flex flex-col w-full mx-auto',
				className,
				isWide ? 'max-w-full' : 'max-w-7xl',
			)}
		>
			{children}
		</div>
	)
}
