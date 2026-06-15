/**
 * strip out all of the back ticks.
 *
 * SHOW CREATE puts backticks __everywhere__
 *
 * until we have an example where that breaks something, they're just too much to force users to have to maintain
 */
export const removeAllBackticks = ({ ddl }: { ddl: string }) =>
  ddl.replace(/`/g, '');
