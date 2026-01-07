import { DateTimeField } from "@components/CRM/ui/date-time-field";
import FullDiv from "@components/CRM/ui/full-div";
import { calculateProgress } from "./calculate-progress";
import { Bar } from "./bar";

export const defaultProps = {
	startDate: "2025-12-01T10:00:00.000Z", //no-bundle:
	endDate: "2025-12-31T18:00:00.000Z", //no-bundle:
	//bundle-only: startDate:ctx.record.createdAt,
	//bundle-only: endDate:ctx.value
};

function SlaDateBar({
	startDate = defaultProps.startDate,
	endDate = defaultProps.endDate,
}: {
	startDate: string;
	endDate: string;
}) {
	if (!startDate || !endDate) return null;

	const currentDate = new Date();

	const progress = calculateProgress(startDate, endDate, currentDate);

	return (
		<FullDiv>
			<div
				style={{
					display: "grid",
					width: "100%",
					maxWidth: "300px",
				}}
			>
				<div
					style={{
						display: "grid",
						width: "100%",
					}}
				>
					<DateTimeField dateStr={endDate} />
				</div>
				<Bar progress={progress} />
			</div>
		</FullDiv>
	);
}

export default SlaDateBar;
