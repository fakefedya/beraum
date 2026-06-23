import { Icons } from '@/src/components/ui/icons'

export const Toggle = () => {
	return (
		<div className='relative w-fit'>
			<div className='h-full items-center rounded-full flex gap-1.5 p-1 bg-brand-dark'>
				<div className=''>
					<Icons.logo />
				</div>
				<div className=''>Уценка</div>
			</div>
		</div>
	)
}
