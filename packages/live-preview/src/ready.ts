export const ready = (args: { serverURL: string }): void => {
  const { serverURL } = args

  if (typeof window !== 'undefined') {
    const windowToPostTo: Window = window?.opener || window?.parent

    windowToPostTo?.postMessage(
      {
        type: 'payload-live-preview',
        ready: true,
      },
      serverURL,
    )
  }
}
