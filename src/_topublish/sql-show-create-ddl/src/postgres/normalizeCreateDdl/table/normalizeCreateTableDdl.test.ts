import { normalizeCreateTableDdl } from './normalizeCreateTableDdl';

const exampleShowCreateDdl = `
CREATE TABLE public.test_tb_for_show_create_on (
  id bigint NOT NULL DEFAULT nextval('test_tb_for_show_create_on_id_seq'::regclass),
  name character varying(150)  NULL,
  counter integer NULL,
  level character varying(50)  NULL,
CONSTRAINT test_tb_for_show_create_on_level_check
  CHECK (((level)::text = ANY ((ARRAY['info'::character varying, 'warn'::character varying, 'error'::character varying])::text[]))),
CONSTRAINT test_tb_for_show_create_on_pkey
  PRIMARY KEY (id));
`.trim();

describe('normalizeCreateTableDdl', () => {
  it('should be able to swap `character varying` with varchar, since its more standard', () => {
    const normalizedDdl = normalizeCreateTableDdl({
      ddl: exampleShowCreateDdl,
    });
    expect(normalizedDdl).not.toContain('character varying');
  });
  it('should be able find where serial column was replaced with lowlevel def, since its more helpful', () => {
    const normalizedDdl = normalizeCreateTableDdl({
      ddl: exampleShowCreateDdl,
    });
    expect(normalizedDdl).not.toContain(
      "bigint DEFAULT nextval('test_tb_for_show_create_on_id_seq' :: regclass)",
    );
    expect(normalizedDdl).toContain('bigserial');
  });
  it('should be able to fix the serial column def even if split across newlines', () => {
    const rawDdl = `
CREATE TABLE public.generate_table_column_test_table (
  id bigint NOT NULL DEFAULT nextval(
    'generate_table_column_test_table_id_seq' :: regclass
  )
);
    `;
    const normalizedDdl = normalizeCreateTableDdl({ ddl: rawDdl });
    expect(normalizedDdl).not.toContain('bigint');
    expect(normalizedDdl).toContain('bigserial');
  });
  it('should strip out the ::__TYPE__ casting that our show create returns, since that level of granularity is not useful', () => {
    const normalizedDdl = normalizeCreateTableDdl({
      ddl: exampleShowCreateDdl,
    });
    expect(normalizedDdl).not.toContain(
      "bigint DEFAULT nextval('test_tb_for_show_create_on_id_seq' :: regclass)",
    );
    expect(normalizedDdl).toContain('bigserial');
  });
  it('should normalize ` integer ` into ` int `, since postgres does not have a `biginteger` and only `bigint`, for consistency', () => {
    const normalizedDdl = normalizeCreateTableDdl({
      ddl: exampleShowCreateDdl,
    });
    expect(normalizedDdl).not.toContain('integer');
    expect(normalizedDdl).toContain(' int ');
  });
  it('should normalize typical conversion of check in constraint back to check in', () => {
    const checkConstraintContainingDdl = `
CREATE TABLE generate_table_test (
  id bigint NOT NULL,
  reference_id bigint NOT NULL,
  second_reference_id bigint NOT NULL,
  status varchar NOT NULL,
  CONSTRAINT generate_table_test_pk PRIMARY KEY (id),
  CONSTRAINT generate_table_test_ux1 UNIQUE (reference_id),
  CONSTRAINT generate_table_test_fk0 FOREIGN KEY (reference_id) REFERENCES generate_table_test_referenced(id),
  CONSTRAINT generate_table_test_fk1 FOREIGN KEY (second_reference_id) REFERENCES generate_table_test_referenced(id),
  CONSTRAINT generate_table_test_status_check CHECK (
    (
      (status) = ANY (
        (
          ARRAY ['QUEUED', 'ATTEMPTED', 'FULFILLED']
        )
      )
    )
  )
);
CREATE INDEX generate_table_test_fk0_ix ON generate_table_test USING btree (reference_id);
CREATE INDEX generate_table_test_fk1_ix ON generate_table_test USING btree (second_reference_id);
    `;
    const normalizedDdl = normalizeCreateTableDdl({
      ddl: checkConstraintContainingDdl,
    });
    expect(normalizedDdl).toContain(
      "CHECK (status IN ('QUEUED', 'ATTEMPTED', 'FULFILLED'))",
    );
  });
  it('should add a space between the referenced table and the referenced column', () => {
    const checkConstraintContainingDdl = `
CREATE TABLE generate_table_test (
  id bigint NOT NULL,
  reference_id bigint NOT NULL,
  second_reference_id bigint NOT NULL,
  status varchar NOT NULL,
  CONSTRAINT generate_table_test_pk PRIMARY KEY (id),
  CONSTRAINT generate_table_test_ux1 UNIQUE (reference_id),
  CONSTRAINT generate_table_test_fk0 FOREIGN KEY (reference_id) REFERENCES generate_table_test_referenced(id),
  CONSTRAINT generate_table_test_fk1 FOREIGN KEY (second_reference_id) REFERENCES generate_table_test_referenced(id),
);
CREATE INDEX generate_table_test_fk0_ix ON generate_table_test USING btree (reference_id);
CREATE INDEX generate_table_test_fk1_ix ON generate_table_test USING btree (second_reference_id);
    `;
    const normalizedDdl = normalizeCreateTableDdl({
      ddl: checkConstraintContainingDdl,
    });
    expect(normalizedDdl).not.toContain('generate_table_test_referenced(id)');
    expect(normalizedDdl).toContain('generate_table_test_referenced (id)');
  });
});
