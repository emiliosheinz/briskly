export const sanitize = (str: string) =>
  str.replace(/[^\w ,.áéíñóúü-]/gim, '').trim()
