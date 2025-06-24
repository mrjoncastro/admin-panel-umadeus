export async function logError(
  err: unknown,
  context: Record<string, unknown> = {},
) {
  console.error({
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    ...context,
  })
}

export async function logConciliacaoErro(
  message: string,
  context: Record<string, unknown> = {},
) {
  await logError(new Error(message), context)
}
