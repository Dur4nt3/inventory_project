const devEnvVars = [
    'ROLE_NAME',
    'DATABASE_PASSWORD',
    'DATABASE',
    'HOST',
    'DATABASE_PORT',
];

export default function checkEnvVars() {
    if (process.env.DATABASE_URL) {
        console.log('Railway database connection variable set, exiting.');
        return;
    }

    const unsetVars = devEnvVars.filter((key) => !process.env[key]);

    let additionalErrors;

    if (unsetVars.length === devEnvVars.length) {
        additionalErrors =
            'All variables missing, meaning this is potentially a production environment without the railway variable';
    }

    if (unsetVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}`,
            additionalErrors,
        );
    }
}
