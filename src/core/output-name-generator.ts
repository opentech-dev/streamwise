

const event = (code: string, id: number| string, event: string) => `${code}.${id}:$${event}`;

export const outputNameGenerator = (id: number | string, code: string ) => {
  if (code === 'PRC' ) {
    return event(code, id, 'otbound')
  }
}