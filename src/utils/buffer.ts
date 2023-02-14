export const bufferFromString = (str: string): Buffer => {
  const buffer = Buffer.alloc(str.length)
  buffer.write(str)
  return buffer
};