import { baseCtx as ctx } from "@/nocobase/ctx";
import { SetorDemanda, Usuario } from "@components/CRM/@types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Error } from "./error";
import { useForm } from "@/nocobase/utils/useForm";
import { Select, Spin, Tag } from "antd";
import { CloseOutlined } from "@ant-design/icons";

// Constantes de configuração local
const optionIdKey = "id";
const optionLabelKey = "f_setor";
const optionColorKey = "f_cor_setor";
const defaultColor = "#1890ff";

interface MultipleSelectProps {
    fieldId?: string;
    fieldLabel?: string;
    placeholderDefault?: string;
    placeholderLoading?: string;
    notFoundMessage?: string;
}

const defaultPropsConfig = {
    fieldId: "f_demanda_setor_cff14fcbab3",
    fieldLabel: "Setor",
    placeholderDefault: "Selecione",
    placeholderLoading: "Carregando...",
    notFoundMessage: "Nenhum resultado encontrado"
}

function MultipleSelect({
    fieldId = defaultPropsConfig.fieldId,
    fieldLabel = defaultPropsConfig.fieldLabel,
    placeholderDefault = defaultPropsConfig.placeholderDefault,
    placeholderLoading = defaultPropsConfig.placeholderLoading,
    notFoundMessage = defaultPropsConfig.notFoundMessage
}: MultipleSelectProps) {

    const form = useForm();

    const [options, setOptions] = useState<SetorDemanda[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Obtém o valor atual do formulário para controlar o input (controlled component)
    // O valor no form normalmente é o objeto ou array de objetos selecionados, ou IDs dependendo da config.
    // Aqui assumimos que queremos controlar visualmente com IDs.
    const currentValue = form?.getFieldValue(fieldId);

    // Calcula os IDs selecionados com base no valor do form
    const selectedValueIds = useMemo(() => {
        if (Array.isArray(currentValue)) {
            return currentValue.map((v: any) => (typeof v === 'object' ? v[optionIdKey] : v));
        }
        return [];
    }, [currentValue]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // 1. Busca paralela de Usuário e Opções
                const [userResponse, optionsResponse] = await Promise.all([
                    ctx.api.request<Usuario>({
                        url: `users:get/${ctx?.user?.id}`,
                        method: 'get',
                        params: {
                            appends: ["f_fk_setor_x_colaborador_v2"]
                        }
                    }),
                    ctx.api.request<SetorDemanda>({
                        url: 't_demandas_setor_v2:list',
                        method: 'get'
                    })
                ]);

                // 2. Processa dados do Usuário
                const userData = userResponse?.data?.data;
                const fetchedUserIds = userData?.f_fk_setor_x_colaborador_v2?.map(setor => setor.id) ?? [];

                // 3. Processa Opções
                const optionsData = optionsResponse?.data?.data;

                if (!Array.isArray(optionsData)) {
                    setError("Formato de dados de opções inválido");
                    return;
                }
                setOptions(optionsData);

                // 4. Define valores iniciais do usuário no form SE o campo estiver vazio
                if (optionsData.length > 0 && fetchedUserIds.length > 0) {
                    const currentFormValue = form.getFieldValue(fieldId);
                    const isFieldEmpty = !currentFormValue || (Array.isArray(currentFormValue) && currentFormValue.length === 0);

                    if (isFieldEmpty) {
                        const validInitialIds = fetchedUserIds.filter(id =>
                            optionsData.some(option => option.id === id)
                        );
                        // Salva os objetos completos no form, pois é o padrão esperado muitas vezes no Nocobase
                        const initialSelectedOptions = optionsData.filter(option =>
                            validInitialIds.includes(option.id)
                        );

                        form.setFieldValue(fieldId, initialSelectedOptions);
                    }
                }

            } catch (err) {
                console.error('Erro ao buscar dados:', err);
                setError("Falha ao carregar dados.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fieldId, form]);

    // Prepara opções para o Select do Antd
    const selectOptions = useMemo(() =>
        options?.map(option => ({
            key: option[optionIdKey as keyof typeof option],
            value: option[optionIdKey as keyof typeof option],
            label: (option[optionLabelKey as keyof typeof option] as string) || `Item ${option[optionIdKey as keyof typeof option]}`,
            color: (option[optionColorKey as keyof typeof option] as string) || defaultColor
        })), [options]
    );

    const getColorById = useCallback((id: any) => {
        const option = options.find(opt => opt[optionIdKey as keyof typeof opt] === id);
        return (option?.[optionColorKey as keyof typeof option] as string) || defaultColor;
    }, [options]);

    // Renderizadores customizados do Select
    const renderTag = useCallback((props: { value: any, label: React.ReactNode, closable: boolean, onClose: (event?: any) => void }) => {
        const { value, label, closable, onClose } = props;
        return (
            <Tag
                color={getColorById(value)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    marginRight: 4,
                    borderRadius: 4,
                    fontWeight: 500
                }}
            >
                {label}
                {closable && (
                    <span
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={onClose}
                        style={{ cursor: "pointer", display: 'flex' }}
                    >
                        <CloseOutlined style={{ fontSize: 10 }} />
                    </span>
                )}
            </Tag>
        );
    }, [getColorById]);

    const filterOption = useCallback((input: string, option: any) => {
        const searchValue = input.toLowerCase();
        const optionLabel = option?.label?.toString().toLowerCase() || '';
        return optionLabel.includes(searchValue);
    }, []);

    const renderOption = useCallback((option: { value: any; label: any }) => {
        const color = getColorById(option.value);
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                    style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: '1px solid #d9d9d9',
                    }}
                />
                <span>{option.label}</span>
            </div>
        );
    }, [getColorById]);

    if (error) return <Error error={error} />

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {fieldLabel && (
                <div style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.85)' }}>
                    {fieldLabel}
                </div>
            )}

            <Select
                mode="multiple"
                allowClear
                showSearch
                maxTagCount="responsive"
                optionFilterProp="label"
                filterOption={filterOption}
                value={selectedValueIds}
                onChange={(ids: any[]) => {
                    // Ao alterar, reconstrói o array de objetos completos para salvar no form
                    const selectedOptionsObjects = options.filter(o => ids.includes(o[optionIdKey as keyof typeof o]));
                    form.setFieldValue(fieldId, selectedOptionsObjects);
                }}
                tagRender={renderTag}
                loading={loading}
                placeholder={loading ? placeholderLoading : placeholderDefault}
                style={{ width: '100%' }}
                notFoundContent={loading ? <Spin size="small" /> : notFoundMessage}
            >
                {selectOptions?.map(option => (
                    <Select.Option
                        key={String(option.key)}
                        value={option.value}
                        label={option.label}
                    >
                        {renderOption(option)}
                    </Select.Option>
                ))}
            </Select>
        </div>
    )
}

export default MultipleSelect;