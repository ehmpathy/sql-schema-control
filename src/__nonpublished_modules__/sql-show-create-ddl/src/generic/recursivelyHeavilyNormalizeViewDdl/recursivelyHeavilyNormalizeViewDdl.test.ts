import { recursivelyHeavilyNormalizeViewDdl } from './recursivelyHeavilyNormalizeViewDdl';

describe('recursivelyHeavilyNormalizeViewDdl', () => {
  it('should be able to normalize a more complex postgres viewdef result into something more reasonable, without all the extra parens', () => {
    const rawCreateDefDdl = `
CREATE OR REPLACE VIEW view_home_current AS
SELECT s.id,
  s.uuid,
  s.name,
  ( SELECT array_agg(home_to_host.host_id ORDER BY home_to_host.array_order_index) AS array_agg
          FROM home_to_host
        WHERE (home_to_host.home_id = s.id)) AS host_ids,
  s.built,
  s.bedrooms,
  s.bathrooms,
  ( SELECT array_agg(home_version_to_photo.photo_id ORDER BY home_version_to_photo.array_order_index) AS array_agg
          FROM home_version_to_photo
        WHERE (home_version_to_photo.home_version_id = v.id)) AS photo_ids,
  s.created_at,
  v.effective_at,
  v.created_at AS updated_at
  FROM ((home s
    JOIN home_cvp cvp ON ((s.id = cvp.home_id)))
    JOIN home_version v ON ((v.id = cvp.home_version_id)));
    `;
    const normalizedDdl = recursivelyHeavilyNormalizeViewDdl({ ddl: rawCreateDefDdl });
    expect(normalizedDdl).not.toContain('FROM ((home'); // there is no reason to wrap the "from" clauses in parens...
    expect(normalizedDdl).toMatchSnapshot();
  });
});
