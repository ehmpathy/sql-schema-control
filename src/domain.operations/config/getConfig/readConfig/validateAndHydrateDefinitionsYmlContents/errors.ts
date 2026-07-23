export class InvalidDefinitionError extends Error {
  public explanation: string;
  constructor({ explanation, basis }: { explanation: string; basis: any }) {
    // render like helpful-errors: `ClassName: explanation`, a blank line, then a
    // pretty-printed basis block. this keeps yml-content validation errors (a distinct
    // domain from the cli's helpful-errors) visually consistent with the cli errors an
    // operator sees right next to them, instead of a cramped single-line json after a colon.
    const message = [
      `InvalidDefinitionError: ${explanation}`,
      '',
      JSON.stringify(basis, null, 2),
    ].join('\n');
    super(message);
    this.explanation = explanation;
  }
}
