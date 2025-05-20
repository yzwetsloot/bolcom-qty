import 'dotenv/config'

const envOrBoolean = (environment: string | undefined, boolean?: boolean) => {
  return environment ? environment === 'true' : boolean ?? true
}

const envOrString = (environment: string | undefined, string?: string) => {
  return environment ? environment : string ?? ''
}

const envOrNumber = (environment: string | undefined, number?: number) => {
  return environment ? Number(environment) : number ?? 0
}

const proxy = {
  username: envOrString(process.env.PROXY_USERNAME),
  password: envOrString(process.env.PROXY_PASSWORD),
}

const useProxy = envOrBoolean(process.env.USE_PROXY, true)

const baseURL = 'https://www.bol.com/nl/'

const database = {
  user: envOrString(process.env.DB_USER),
  password: envOrString(process.env.DB_PASS),
  database: envOrString(process.env.DB_NAME),
  host: envOrString(process.env.DB_HOST),
  port: envOrNumber(process.env.DB_PORT),
}

const log = {
  level: envOrString(process.env.LOG_LEVEL, 'info'),
  path: envOrString(process.env.LOG_PATH, 'app.log'),
}

const environment = envOrString(process.env.NODE_ENV, 'dev')

const retryCount = envOrNumber(process.env.RETRY_COUNT, 0) // non-zero value as of yet unsupported

const timeout = envOrNumber(process.env.TIMEOUT, 10000)

const dateRange = envOrNumber(process.env.DATE_RANGE, 7) // in days

const maxQuantity = 500

const taskConcurrency = envOrNumber(process.env.TASK_CONCURRENCY, 3)

export default {
  proxy,
  useProxy,
  baseURL,
  database,
  log,
  environment,
  retryCount,
  timeout,
  dateRange,
  maxQuantity,
  taskConcurrency,
}
