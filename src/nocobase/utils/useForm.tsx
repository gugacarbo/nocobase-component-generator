import { Form } from "antd";

function useForm() {
    const [form] = Form.useForm(); //no-bundle:
    //bundle-only: const form = ctx.form;

    return form;
}

export { useForm };