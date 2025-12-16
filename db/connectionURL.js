import checkEnvVars from "./checkEnvVars.js";

// The "DATABASE_URL environment variable is provided by Railway"
// The other URL is used when in development

const connectionURL =
    process.env.DATABASE_URL ||
    `postgresql://${process.env.ROLE_NAME}:${process.env.DATABASE_PASSWORD}@${
        process.env.HOST
    }:${Number(process.env.DATABASE_PORT)}/${process.env.DATABASE}`;

checkEnvVars();

export default connectionURL;