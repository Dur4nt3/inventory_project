export default function checkEnvVars() {
    if (
        (process.env.ROLE_NAME === undefined ||
            process.env.DATABASE_PASSWORD === undefined ||
            process.env.DATABASE === undefined ||
            process.env.HOST === undefined ||
            process.env.DATABASE_PORT === undefined) &&
        process.env.DATABASE_URL === undefined
    ) {
        console.log('Railway Connection:', process.env.DATABASE_URL);
        console.log('Role:', process.env.ROLE_NAME);
        console.log('Database Password:', process.env.DATABASE_PASSWORD);
        console.log('Database:', process.env.DATABASE);
        console.log('Database Host:', process.env.HOST);
        console.log('Database Port:', process.env.DATABASE_PORT);
        throw new Error(
            'App will not be able to connect to database, please check the above output!',
        );
    }
}
