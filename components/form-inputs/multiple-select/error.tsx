import { Alert, Button } from "antd";

function Error({ error }: { error: string }) {
    const handleRecaload = () => window.location.reload();

    return (

        <div>
            <Alert
                message={error}
                type="error"
                showIcon
                action={
                    <Button size="small" type="text" onClick={handleRecaload}>
                        Recarregar
                    </Button>
                }
            />
        </div>
    )
}

export { Error };