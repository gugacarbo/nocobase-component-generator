export function calculateProgress(
	startDate: string,
	endDate: string,
	currentDate = new Date(),
) {
	if (!startDate || !endDate) {
		return 0;
	}

	const start = new Date(startDate);
	const end = new Date(endDate);
	const current = new Date(currentDate);

	// Se ainda não começou
	if (current < start) {
		return 0;
	}

	// Se já passou do prazo
	if (current > end) {
		return 100;
	}

	// Calcula o progresso
	const totalTime = end.getTime() - start.getTime();
	const elapsedTime = current.getTime() - start.getTime();

	const progress = Math.round((elapsedTime / totalTime) * 100);
	return Math.max(0, Math.min(100, progress)); // Garante que fica entre 0 e 100
}
