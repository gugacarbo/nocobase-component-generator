export const defaultProps = {
	// ============== CONFIGURAÇÕES ==============
	// Configurações do campo
	fieldId: "f_demanda_setor_0ac01f6d826",
	fieldLabel: "Setores",

	// Configurações das opções
	optionIdKey: "id",
	optionLabelKey: "f_setor",
	optionColorKey: "f_cor_setor",

	// API para buscar opções do select
	apiEndpoint: "t_demandas_setor_v2:list",
	apiMethod: "get",

	// Configuração para buscar IDs iniciais do usuário
	userRelationKey: "f_fk_setor_x_colaborador_v2", // Nome da relação no usuário
	userRelationIdKey: "id", // Chave do ID dentro da relação

	// ============================================
	defaultColor: "#1890ff",
	placeholderLoading: "Carregando...",
	placeholderDefault: "Selecione um ou mais status",
	notFoundMessage: "Nenhuma opção encontrada",
	errorMessage: "Erro ao carregar opções. Tente novamente.",
	invalidDataMessage: "Dados inválidos recebidos da API",
};
