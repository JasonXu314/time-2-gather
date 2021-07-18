import styles from './CalendarTile.module.scss';
import EventBanner from './EventBanner/EventBanner';

interface Props {
	events: CalendarEvent[];
	viewDetails: (evt: CalendarEvent) => void;
	date: Date;
}

const CalendarTile: React.FC<Props> = ({ events, date, viewDetails }) => {
	return (
		<div className={styles.main}>
			{date.getDate()}
			<div className={styles.list + (events.length > 3 ? ' ' + styles.long : '')}>
				{events.map((event) => (
					<EventBanner
						key={event._id}
						event={event}
						openDetails={() => {
							viewDetails(event);
						}}
					/>
				))}
			</div>
		</div>
	);
};

export default CalendarTile;
