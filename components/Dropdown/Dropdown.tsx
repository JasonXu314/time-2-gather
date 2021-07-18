import { SelectHTMLAttributes } from 'react';
import styles from './Dropdown.module.scss';

interface Props<T, U extends DropdownOption<T>> extends SelectHTMLAttributes<HTMLSelectElement> {
	options: U[];
}

function Dropdown<T extends string | number | readonly string[] | undefined, U extends DropdownOption<T>>({
	options,
	className,
	...rest
}: Props<T, U>): JSX.Element {
	return (
		<div className={styles.main}>
			<select className={styles.select + (className ? ' ' + className : '')} {...rest}>
				{options.map((option, i) => (
					<option key={i} value={option.value}>
						{option.name}
					</option>
				))}
			</select>
		</div>
	);
}

export default Dropdown;
