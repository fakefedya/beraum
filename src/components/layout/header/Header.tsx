import { Pill } from './_components/Pill'
import { Toggle } from './_components/Toggle'

export const Header = () => {
	return (
		<header className='sticky top-4 h-14 z-100 mx-auto w-full max-w-7xl'>
			<div className='w-full h-full flex '>
				<Toggle />
				<Pill />
			</div>
		</header>
	)
}
