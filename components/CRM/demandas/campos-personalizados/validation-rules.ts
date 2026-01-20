import type { Rule } from "antd/es/form";

// Validador de telefone brasileiro
function validatePhone(_: any, value: string) {
	if (!value) return Promise.resolve();

	const cleaned = value.replace(/\D/g, "");

	// Aceita telefones com 8, 9, 10 ou 11 dígitos
	if (cleaned.length >= 8 && cleaned.length <= 11) {
		return Promise.resolve();
	}

	return Promise.reject(new Error("Telefone inválido"));
}

// Validador de número
function validateNumber(_: any, value: any) {
	if (!value) return Promise.resolve();

	if (isNaN(Number(value))) {
		return Promise.reject(new Error("Deve ser um número válido"));
	}

	return Promise.resolve();
}

// Retorna regras de validação baseadas no tipo do campo
export function getFieldValidationRules(
	type: string,
	required: boolean = false,
): Rule[] {
	const rules: Rule[] = [];

	// Regra de obrigatório
	if (required) {
		rules.push({
			required: true,
			message: "Este campo é obrigatório",
		});
	}

	// Regras específicas por tipo
	switch (type) {
		case "email":
			rules.push({
				type: "email",
				message: "E-mail inválido",
			});
			break;

		case "tel":
			rules.push({
				validator: validatePhone,
			});
			break;

		case "number":
			rules.push({
				validator: validateNumber,
			});
			break;

		case "text":
			rules.push({
				whitespace: true,
				message: "Campo não pode conter apenas espaços",
			});
			break;

		case "textarea":
			rules.push({
				whitespace: true,
				message: "Campo não pode conter apenas espaços",
			});
			rules.push({
				max: 5000,
				message: "Máximo de 5000 caracteres",
			});
			break;

		case "select":
		case "radio":
			if (required) {
				rules.push({
					message: "Selecione uma opção",
				});
			}
			break;

		case "checkbox-group":
			if (required) {
				rules.push({
					type: "array",
					min: 1,
					message: "Selecione ao menos uma opção",
				});
			}
			break;
	}

	return rules;
}
