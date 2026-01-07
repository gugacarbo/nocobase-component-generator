export const formatDate = (date: Date): string => {
	return date.toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export const getRelativeTime = (date: Date): string => {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `há ${days} dia${days > 1 ? "s" : ""}`;
	if (hours > 0) return `há ${hours} hora${hours > 1 ? "s" : ""}`;
	if (minutes > 0) return `há ${minutes} minuto${minutes > 1 ? "s" : ""}`;
	return "agora mesmo";
};

export const formatRelativeTime = (date: Date) => {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const months = Math.floor(days / 30);
	const years = Math.floor(days / 365);

	if (seconds < 60) return "agora mesmo";

	if (minutes < 60) {
		return minutes === 1 ? `Há ${minutes} minuto` : `Há ${minutes} minutos`;
	}
	if (hours < 24) {
		return hours === 1 ? `Há ${hours} hora` : `Há ${hours} horas`;
	}
	if (days < 30) {
		return days === 1 ? `Há ${days} dia` : `Há ${days} dias`;
	}
	if (months < 12) {
		return months === 1 ? `Há ${months} mês` : `Há ${months} meses`;
	}
	return years === 1 ? `Há ${years} ano` : `Há ${years} anos`;
};
