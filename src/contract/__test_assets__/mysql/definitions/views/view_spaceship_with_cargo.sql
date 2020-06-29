CREATE VIEW `view_spaceship_with_cargo` AS
  SELECT
    s.id as id,
    s.name as name,
    SUM(sc.weight) as total_cargo_weight,
    GROUP_CONCAT(DISTINCT sc.purpose) as all_cargo_purpose
  FROM spaceship s
  JOIN spaceship_cargo sc on sc.spaceship_id = s.id;
