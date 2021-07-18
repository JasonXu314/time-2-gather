import { useMemo, useState } from 'react';
import { evtInDay, getDays } from '../../utils/utils';
import Dropdown from '../Dropdown/Dropdown';
import styles from './Calendar.module.scss';
import CalendarTile from './CalendarTile/CalendarTile';
import DummyTile from './DummyTile/DummyTile';

const monthOptions = [
	{ name: 'January', value: 0 },
	{ name: 'February', value: 1 },
	{ name: 'March', value: 2 },
	{ name: 'April', value: 3 },
	{ name: 'May', value: 4 },
	{ name: 'June', value: 5 },
	{ name: 'July', value: 6 },
	{ name: 'August', value: 7 },
	{ name: 'September', value: 8 },
	{ name: 'October', value: 9 },
	{ name: 'November', value: 10 },
	{ name: 'December', value: 11 }
];

interface Props {
	events: CalendarEvent[];
	viewDetails: (evt: CalendarEvent) => void;
}

const Calendar: React.FC<Props> = ({ events, viewDetails }) => {
	const today = useMemo((): Date => new Date(), []);
	const [month, setMonth] = useState<number>(today.getMonth());
	const year = useMemo<number>(() => today.getFullYear(), [today]);
	const numDays = useMemo<number>(() => getDays(month, year), [month, year]);
	const startDayOfWeek = useMemo<number>(() => new Date(year, month, 1).getDay(), [year, month]);

	return (
		<div className={styles.main}>
			<div className={styles.controls}>
				<Dropdown options={monthOptions} onChange={(evt) => setMonth(parseInt(evt.target.value))} />
			</div>
			<div className={styles.days}>
				{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => (
					<div key={i} className={styles.day}>
						{day}
					</div>
				))}
			</div>
			<div className={styles.body}>
				<div className={styles.row}>
					{[...new Array(7)].map((_, i) =>
						i - startDayOfWeek + 1 <= 0 ? (
							<DummyTile key={i - startDayOfWeek + 1} />
						) : (
							<CalendarTile
								key={i - startDayOfWeek + 1}
								date={new Date(year, month, i - startDayOfWeek + 1)}
								viewDetails={viewDetails}
								events={events.filter((evt) => evtInDay(evt, new Date(year, month, i - startDayOfWeek + 1)))}
							/>
						)
					)}
				</div>
				{[...new Array(Math.ceil((numDays + startDayOfWeek) / 7) - 1)].map((_, row, arr) =>
					row === arr.length - 1 ? (
						<div key={row + 1} className={styles.row}>
							{[...new Array(7)].map((_, i) =>
								(row + 1) * 7 + i - startDayOfWeek + 1 > numDays ? (
									<DummyTile key={i - startDayOfWeek + 1} />
								) : (
									<CalendarTile
										key={(row + 1) * 7 + i - startDayOfWeek + 1}
										date={new Date(year, month, (row + 1) * 7 + i - startDayOfWeek + 1)}
										viewDetails={viewDetails}
										events={events.filter((evt) => evtInDay(evt, new Date(year, month, (row + 1) * 7 + i - startDayOfWeek + 1)))}
									/>
								)
							)}
						</div>
					) : (
						<div key={row + 1} className={styles.row}>
							{[...new Array(7)].map((_, i) => (
								<CalendarTile
									key={(row + 1) * 7 + i - startDayOfWeek + 1}
									date={new Date(year, month, (row + 1) * 7 + i - startDayOfWeek + 1)}
									viewDetails={viewDetails}
									events={events.filter((evt) => evtInDay(evt, new Date(year, month, (row + 1) * 7 + i - startDayOfWeek + 1)))}
								/>
							))}
						</div>
					)
				)}
			</div>
		</div>
	);
};

export default Calendar;
